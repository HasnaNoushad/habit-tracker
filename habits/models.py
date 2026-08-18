from django.db import models
from django.db import models
from django.contrib.auth.models import User


class Habit(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    date = models.DateField()
    is_done = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.habit.name} - {self.date}"
