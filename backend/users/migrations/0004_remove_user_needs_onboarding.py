# Generated by Django 5.1.2 on 2024-12-14 09:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_teaminvite_accepted_invite'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='needs_onboarding',
        ),
    ]
