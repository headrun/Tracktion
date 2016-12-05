from django.core.management.base import BaseCommand, CommandError

from api.models import Claim, Enrollment
import random

class Command(BaseCommand):

    def handle(self, *args, **options):
        diseases = {}
        for line in open('disease_mappping.csv', 'r'):
            code, _, disease = line.strip().split('\t')
            diseases[code] = disease

        for obj in Claim.objects.exclude(member=None).filter(disease_category=''):
            if diseases.has_key(obj.dx_1.replace('.', '')):
                obj.disease_category = diseases[obj.dx_1.replace('.', '')]
                obj.save()

