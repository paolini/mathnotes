# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-21 09:35
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_note_author'),
    ]

    operations = [
        migrations.RenameField(
            model_name='note',
            old_name='id',
            new_name='hash',
        ),
    ]
