const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// URL de conexión a MongoDB (usando variable de entorno o fallback a localhost)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conexión a MongoDB establecida'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir modelo de tareas
const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);

// Rutas API
// Obtener todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear una nueva tarea
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task({
      text: req.body.text,
      completed: req.body.completed || false
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar una tarea
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    if (req.body.text !== undefined) updateData.text = req.body.text;
    if (req.body.completed !== undefined) updateData.completed = req.body.completed;
    
    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una tarea
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
