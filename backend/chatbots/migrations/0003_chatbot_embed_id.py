# Generated by Django 5.1.2 on 2024-10-23 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatbots', '0002_alter_chatbot_organization'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatbot',
            name='embed_id',
            field=models.UUIDField(editable=False, null=True, unique=True),
        ),
    ]
