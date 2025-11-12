from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('name', models.CharField(max_length=120)),
                ('avatar_url', models.URLField(blank=True, default='')),
                ('phone', models.CharField(blank=True, default='', max_length=32)),
                ('about', models.TextField(blank=True, default='')),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('password', models.CharField(max_length=128)),
            ],
        ),
        migrations.CreateModel(
            name='Ad',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('category', models.CharField(max_length=20)),
                ('phone', models.CharField(max_length=32)),
                ('condition', models.CharField(max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ads', to='api.member')),
            ],
        ),
        migrations.CreateModel(
            name='ChatThread',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('ad', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='threads', to='api.ad')),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='threads_as_user1', to='api.member')),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='threads_as_user2', to='api.member')),
            ],
            options={
                'unique_together': {('user1', 'user2', 'ad')},
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.member')),
                ('thread', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.chatthread')),
            ],
        ),
    ]
