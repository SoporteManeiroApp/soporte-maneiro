import django_filters
from django.utils.timezone import make_aware
from datetime import datetime, time
from .models import Request

class RequestFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    end_date = django_filters.DateFilter(method='filter_end_date')

    def filter_end_date(self, queryset, name, value):
        end_of_day = datetime.combine(value, time.max)
        return queryset.filter(created_at__lte=make_aware(end_of_day))

    class Meta:
        model = Request
        fields = ['start_date', 'end_date']
