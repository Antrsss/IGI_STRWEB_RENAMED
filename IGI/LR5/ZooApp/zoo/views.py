from django.shortcuts import render, redirect, get_object_or_404
from zoo.models import EmployeePositions
from zoo.forms import EmployeePositionForm

# Create (Создание)
def position_create(request):
    if request.method == 'POST':
        form = EmployeePositionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('position_list')
    else:
        form = EmployeePositionForm()
    return render(request, 'zoo/position_form.html', {'form': form})

# Read (Просмотр списка)
def position_list(request):
    positions = EmployeePositions.objects.all()
    return render(request, 'zoo/position_list.html', {'positions': positions})

# Read (Детальный просмотр)
def position_detail(request, pk):
    position = get_object_or_404(EmployeePositions, pk=pk)
    return render(request, 'zoo/position_detail.html', {'position': position})

# Update (Обновление)
def position_update(request, pk):
    position = get_object_or_404(EmployeePositions, pk=pk)
    if request.method == 'POST':
        form = EmployeePositionForm(request.POST, instance=position)
        if form.is_valid():
            form.save()
            return redirect('position_detail', pk=position.pk)
    else:
        form = EmployeePositionForm(instance=position)
    return render(request, 'zoo/position_form.html', {'form': form})

# Delete (Удаление)
def position_delete(request, pk):
    position = get_object_or_404(EmployeePositions, pk=pk)
    if request.method == 'POST':
        position.delete()
        return redirect('position_list')
    return render(request, 'zoo/position_confirm_delete.html', {'position': position})