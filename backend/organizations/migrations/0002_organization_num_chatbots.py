# Generated by Django 5.1.2 on 2024-12-08 12:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='num_chatbots',
            field=models.IntegerField(default=0),
        ),
    ]
