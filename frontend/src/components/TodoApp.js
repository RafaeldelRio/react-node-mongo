import React, { useState, useEffect } from 'react';

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL de la API (utilizando ruta relativa aprovechando el proxy de Nginx)
  const API_URL = 'http://localhost:5000/api/tasks';
  // const API_URL = '/api/tasks';

  // Cargar tareas desde el servidor
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Error al cargar las tareas');
        }
        const data = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar las tareas. ' + err.message);
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Agregar una nueva tarea
  const addTask = async () => {
    if (newTask.trim() !== '') {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newTask, completed: false }),
        });

        if (!response.ok) {
          throw new Error('Error al agregar la tarea');
        }

        const addedTask = await response.json();
        setTasks([...tasks, addedTask]);
        setNewTask('');
      } catch (err) {
        setError('No se pudo agregar la tarea. ' + err.message);
        console.error('Error adding task:', err);
      }
    }
  };

  // Marcar tarea como completada
  const toggleComplete = async (taskId) => {
    try {
      const taskToUpdate = tasks.find(task => task._id === taskId);
      
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !taskToUpdate.completed }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la tarea');
      }

      setTasks(
        tasks.map(task => 
          task._id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (err) {
      setError('No se pudo actualizar la tarea. ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  // Eliminar tarea
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la tarea');
      }

      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('No se pudo eliminar la tarea. ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  // Manejar la tecla Enter para agregar tarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Lista de Tareas</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nueva tarea..."
          className="flex-grow px-3 py-2 border rounded-l focus:outline-none"
        />
        <button 
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Agregar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Cargando tareas...</div>
      ) : (
        <>
          <ul className="space-y-2">
            {tasks.map(task => (
              <li 
                key={task._id} 
                className="flex items-center justify-between p-3 border rounded bg-gray-50"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task._id)}
                    className="mr-3"
                  />
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>
                    {task.text}
                  </span>
                </div>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No hay tareas pendientes</p>
          )}
          
          {tasks.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {tasks.filter(task => task.completed).length} de {tasks.length} tareas completadas
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodoApp;
