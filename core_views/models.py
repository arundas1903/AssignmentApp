from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import JSONField

class User(AbstractUser):
    phone_number = models.CharField(max_length=13, unique=True, blank=True, null=True)
    meta = JSONField(null=True)
