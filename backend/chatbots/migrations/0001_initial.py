# Generated by Django 5.1.2 on 2024-12-03 18:14

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('organizations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Chatbot',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('embed_id', models.UUIDField(editable=False, null=True, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('initial_message', models.TextField()),
                ('image', models.URLField(blank=True, null=True)),
                ('primary_color', models.CharField(blank=True, max_length=10, null=True)),
                ('secondary_color', models.CharField(blank=True, max_length=10, null=True)),
                ('chatbot_border_radius', models.IntegerField(blank=True, null=True)),
                ('font_size', models.IntegerField(blank=True, null=True)),
                ('widget_color', models.CharField(blank=True, max_length=10, null=True)),
                ('widget_border_radius', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('chatbot_type', models.CharField(blank=True, max_length=20, null=True)),
                ('status', models.CharField(choices=[('training', 'Training'), ('live', 'Live'), ('failed', 'Failed')], default='training', max_length=20)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chatbots', to='organizations.organization')),
            ],
            options={
                'db_table': 'chatbots',
            },
        ),
        migrations.CreateModel(
            name='ChatbotUser',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('full_name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('history', models.JSONField(blank=True, default=list, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('chatbot', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users', to='chatbots.chatbot')),
            ],
            options={
                'db_table': 'organization_customers',
            },
        ),
    ]
