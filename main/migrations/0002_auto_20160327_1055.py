# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-27 08:55
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_squashed_0006_auto_20160321_1134'),
    ]

    operations = [
        migrations.AddField(
            model_name='note',
            name='parent',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='main.Note'),
        ),
        migrations.AlterField(
            model_name='note',
            name='created_on',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='note',
            name='modified_on',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
