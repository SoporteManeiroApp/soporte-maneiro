import io
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Cm
from django.http import FileResponse, HttpResponse
from django.utils.timezone import make_aware
from datetime import datetime, time
import os
import locale
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from tempfile import NamedTemporaryFile

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404 

from .models import Request
from .serializers import RequestSerializer
from .filters import RequestFilter
from department.models import Department
from django.contrib.auth import get_user_model

from django.utils import timezone

User = get_user_model()

class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all().order_by('-created_at')
    permission_classes = [permissions.AllowAny]
    serializer_class = RequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = RequestFilter

    @action(detail=False, methods=['get'], url_path='generate_report')
    def generate_report(self, request):
        # Configuracion meses a español
        try:
            locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
        except locale.Error:
            try:
                locale.setlocale(locale.LC_TIME, 'Spanish_Spain.1252')
            except locale.Error:
                locale.setlocale(locale.LC_TIME, '')

        # Obtiene fechas del query
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not start_date or not end_date:
            return Response({"error": "Parámetros start_date y end_date requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start = make_aware(datetime.strptime(start_date, "%Y-%m-%d"))
            end = make_aware(datetime.combine(datetime.strptime(end_date, "%Y-%m-%d"), time.max))
        except ValueError:
            return Response({"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        requests = Request.objects.filter(created_at__range=(start, end))

        # Procesa las solicitudes
        report_items = []
        for req in requests:
            report_items.append({
                'id': req.id,
                'subject': req.subject,
                'description': req.description,
                'department': req.department.id,
                'department_name': req.department.name,
                'technician': req.technician.id,
                'technician_full_name': f"{req.technician.first_name} {req.technician.last_name}".strip(),
                'created_at': req.created_at.isoformat(),
                'date': req.created_at.strftime('%d de %B del %Y'),
                'note': req.note,
            })

        # Datos de departamentos para gráfico
        dept_data = Department.objects.all()
        unique_dept_names = sorted([dept.name for dept in dept_data])
        req_by_dept = {}
        for r in report_items:
            d_name = r['department_name']
            req_by_dept[d_name] = req_by_dept.get(d_name, 0) + 1

        exist_counts = pd.Series(req_by_dept)
        full_counts = exist_counts.reindex(unique_dept_names, fill_value=0).sort_index()

        # Genera gráfico y guarda temporalmente
        with NamedTemporaryFile(suffix=".png", delete=False) as chart_file:
            plt.figure(figsize=(10, 6))
            full_counts.plot(kind='bar', color='skyblue')
            plt.title('Número de Solicitudes por Departamento')
            plt.xlabel('Departamento')
            plt.ylabel('Número de Solicitudes')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig(chart_file.name, dpi=300)
            plt.close()
            chart_path = chart_file.name

        doc = DocxTemplate(os.path.join('formato', 'formato_informe_grafica.docx')) # Esta es tu plantilla para el informe con gráfico

        # Rango de fechas en texto
        rango_fechas = f"Desde el {start.strftime('%d de %B del %Y')} hasta el {end.strftime('%d de %B del %Y')}"

        context = {
            'items': report_items,
            'dept_chart': InlineImage(doc, chart_path, Cm(15)),
            'rango_fechas': rango_fechas
        }

        # Guarda el .docx temporalmente
        with NamedTemporaryFile(suffix=".docx", delete=False) as tmp_docx:
            doc.render(context)
            doc.save(tmp_docx.name)
            tmp_docx.seek(0)
            response = FileResponse(open(tmp_docx.name, 'rb'), as_attachment=True, filename='reporte_solicitudes.docx')

        # eliminar el gráfico
        try:
            os.remove(chart_path)
        except Exception as e:
            print(f"Error al borrar gráfico: {e}")

        return response

    # Nueva acción para generar reporte por ID
    @action(detail=True, methods=['get'], url_path='generate_single_report') # detail=True indica que espera un ID en la URL
    def generate_single_report(self, request, pk=None):
        user = request.user

        if not user.is_authenticated or (not user.is_superuser and not user.is_staff):
            return Response(
                {"detail": "No tienes permisos para generar este informe."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            report_request = get_object_or_404(
                Request.objects.select_related('department', 'technician'),
                pk=pk
            )
        except Exception as e:
            return Response(
                {"detail": f"Solicitud no encontrada o error al obtenerla: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
        except locale.Error:
            try:
                locale.setlocale(locale.LC_TIME, 'Spanish_Spain.1252')
            except locale.Error:
                locale.setlocale(locale.LC_TIME, '')
                
        context = {
            'request': {
                'id': report_request.id,
                'subject': report_request.subject,
                'description': report_request.description,
                'note': report_request.note,
                'created_at': timezone.localtime(report_request.created_at).strftime('%d de %B del %Y'),
                'department_name': report_request.department.name if report_request.department else 'N/A',
                'technician_full_name': f"{report_request.technician.first_name} {report_request.technician.last_name}".strip() if report_request.technician else 'N/A',
            }
        }

        try:
            template_path = os.path.join('formato', 'formato_informe2.docx')
            doc = DocxTemplate(template_path)
            doc.render(context)

            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)

            filename = f"informe_solicitud_{report_request.id}.docx"
            response = HttpResponse(
                buffer.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response

        except FileNotFoundError:
            return Response(
                {"detail": f"La plantilla del informe '{template_path}' no se encontró en el servidor. Asegúrate de que la ruta es correcta."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"detail": f"Error al generar el informe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
"""""
        -------------------------------------------------------------------------
        guardar varias solicitudes en un word
        -------------------------------------------------------------------------
        
        requests = Request.objects.filter(created_at__range=(start, end))

        # Procesa las solicitudes
        report_items = []
        for req in requests:
            report_items.append({
                'id': req.id,
                'subject': req.subject,
                'description': req.description,
                'department': req.department.id,
                'department_name': req.department.name,
                'technician': req.technician.id,
                'technician_full_name': f"{req.technician.first_name} {req.technician.last_name}".strip(),
                'created_at': req.created_at.isoformat(),
                'date': req.created_at.strftime('%d de %B del %Y'),
                'note': req.note,
            })

        # Datos de departamentos para gráfico
        dept_data = Department.objects.all()
        unique_dept_names = sorted([dept.name for dept in dept_data])
        req_by_dept = {}
        for r in report_items:
            d_name = r['department_name']
            req_by_dept[d_name] = req_by_dept.get(d_name, 0) + 1

        exist_counts = pd.Series(req_by_dept)
        full_counts = exist_counts.reindex(unique_dept_names, fill_value=0).sort_index()

        # Genera gráfico y guarda temporalmente
        with NamedTemporaryFile(suffix=".png", delete=False) as chart_file:
            plt.figure(figsize=(10, 6))
            full_counts.plot(kind='bar', color='skyblue')
            plt.title('Número de Solicitudes por Departamento')
            plt.xlabel('Departamento')
            plt.ylabel('Número de Solicitudes')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig(chart_file.name, dpi=300)
            plt.close()
            chart_path = chart_file.name

        doc = DocxTemplate(os.path.join('formato', 'formato_informe.docx'))

        # Rango de fechas en texto
        rango_fechas = f"Desde el {start.strftime('%d de %B del %Y')} hasta el {end.strftime('%d de %B del %Y')}"

        context = {
            'items': report_items,
            'dept_chart': InlineImage(doc, chart_path, Cm(15)),
            'rango_fechas': rango_fechas
        }

        # Guarda el .docx temporalmente
        with NamedTemporaryFile(suffix=".docx", delete=False) as tmp_docx:
            doc.render(context)
            doc.save(tmp_docx.name)
            tmp_docx.seek(0)
            response = FileResponse(open(tmp_docx.name, 'rb'), as_attachment=True, filename='reporte_solicitudes.docx')

        # eliminar el gráfico
        try:
            os.remove(chart_path)
        except Exception as e:
            print(f"Error al borrar gráfico: {e}")
        """""