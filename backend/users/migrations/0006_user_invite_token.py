# Generated by Django 5.1.2 on 2024-12-19 10:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_user_accepted_invite'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='invite_token',
            field=models.UUIDField(blank=True, null=True),
        ),
    ]
