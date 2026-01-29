const express = require("express");
const fs = require("fs");
const path = require('path'); 
const app = express();
const PORT = 3000;

// Archivo JSON que actúa como base de datos
const DB_FILE = "./users.json";

// 1. Middleware para manejar JSON (Siempre al inicio)
app.use(express.json());

// 2. RUTA RAÍZ (ESTA ES LA QUE EVALÚA EL TEST DE JENKINS)
// Debe ir ANTES del static para tener prioridad y devolver el JSON
app.get("/", (req, res) => {
  const msg = {
    message: "Servidor en ejecucion en el puerto 3000",
    status: 200,
  };
  res.json(msg);
});

// 3. Servir archivos estáticos (Tu carpeta PayPhone)
// NOTA: Para ver tu diseño, ahora deberás entrar a: http://localhost:3000/index.html
app.use(express.static(path.join(__dirname, 'PayPhone')));

// --- FUNCIONES DE BASE DE DATOS ---
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // Si el archivo no existe, retorna un array vacío
    return [];
  }
};

const writeDatabase = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
};

// --- CRUD DE USUARIOS ---

// 1. Obtener todos los usuarios
app.get("/users", (req, res) => {
  const users = readDatabase();
  res.json(users);
});

// 2. Crear un nuevo usuario
app.post("/users", (req, res) => {
  const users = readDatabase();
  const newUser = req.body;

  if (!newUser.id || !newUser.name || !newUser.email) {
    return res.status(400).json({ error: "ID, name, and email are required" });
  }

  // Verifica si el usuario ya existe
  if (users.some((user) => user.id === newUser.id)) {
    return res
      .status(400)
      .json({ error: "User with the same ID already exists" });
  }

  users.push(newUser);
  writeDatabase(users);

  res.status(201).json({ message: "User created successfully", user: newUser });
});

// 3. Actualizar un usuario
app.put("/users/:id", (req, res) => {
  const users = readDatabase();
  const userId = req.params.id;
  const updatedUser = req.body;

  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex] = { ...users[userIndex], ...updatedUser };
  writeDatabase(users);

  res.json({ message: "User updated successfully", user: users[userIndex] });
});

// 4. Eliminar un usuario
app.delete("/users/:id", (req, res) => {
  const users = readDatabase();
  const userId = req.params.id;

  const filteredUsers = users.filter((user) => user.id !== userId);

  if (filteredUsers.length === users.length) {
    return res.status(404).json({ error: "User not found" });
  }

  writeDatabase(filteredUsers);

  res.json({ message: "User deleted successfully" });
});

// 5. Buscar un usuario
app.get("/users/:id", (req, res) => {
  const users = readDatabase();
  const userId = req.params.id;
  
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

// EXPORTAR APP (Vital para que Jest funcione)
module.exports = app;

// Iniciar el servidor (Solo si no es un test)
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
}