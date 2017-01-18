from __future__ import unicode_literals

from django.db import models

# Create your models here.

class SocialAPI(models.Model):

    source      = models.CharField(max_length=20, null=True, blank=True)
    query       = models.TextField(blank=True)
    sources     = models.CharField(max_length=50, null=True, blank=True)
    days        = models.IntegerField(max_length=5)
    added_by    = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True, null=True)
    modified_at = models.DateTimeField(auto_now=True, null=True)
    last_seen   = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = u'social_api'
        unique_together = (('source'),)
