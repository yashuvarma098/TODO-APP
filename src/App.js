import React, { useEffect, useState } from "react";
import './App.css';
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';




function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])
  const [editID, setEditID] = useState(null)
  const [editText, setEditText] = useState('')
  const [darkmode, setDarkMode] = useState(false)
  const [time, setTime] = useState(new Date())
  const [quote, setQuote] = useState('')
  const [search, setSearch] = useState('')
  const [streak, setStreak] = useState(0)
  const [taskTime, setTaskTime] = useState('')
  const [priority, setPriority] =  useState('low')

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Random quotes
  useEffect(() => {
    fetch("https://api.quotable.io/random")
      .then((res) => res.json())
      .then((data) => setQuote(data.content))
      .catch(() => setQuote("Keep going,  Yashashree!!"))
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    const savedDarkMode = JSON.parse(localStorage.getItem("darkmode"));
    const savedStreak = Number(localStorage.getItem("streak")) || 0;
    const lastDate = localStorage.getItem("lastOpened");
    const today = new Date().toDateString();
    if (savedTasks) setTasks(savedTasks);
    if (savedDarkMode) setDarkMode(savedDarkMode);

    // update streak
    if (lastDate !== today) {
      const newStreak = savedStreak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", newStreak);
      localStorage.setItem("lastOpened", today);
    } else {
      setStreak(savedStreak);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('darkmode', JSON.stringify(darkmode));

  }, [tasks, darkmode]);

  // Greet based on time
  const hour = time.getHours();
  let greeting =
    hour < 12 ? "Good Morning!!" : hour < 18 ? "Good Afternoon!!" : "Good Evening!!";

  // progress calculation
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);


  // Add Task function
  const addTask = () => {
    if (task.trim() === '') return;
    const newTask = { id: Date.now(), text: String(task), completed: false, time: taskTime || "", priority: priority, };
    setTasks([...tasks, newTask]);
    setTask('');
    setTaskTime('');
    toast.success("Task added successfully!");
  };


  // Delete Task function
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast.info("Task deleted");
  };



  // Mark complete
  const toggleComplete = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // Edit Task
  const startEdit = (id, text) => {
    setEditID(id);
    setEditText(text);
  };

  // Save edited task
  const saveEdit = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, text: editText } : t   //Replace the text of the task whose id matches editId with new editText.
      )
    );
    setEditID(null);
    setEditText('');
    toast.success("Task updated");
  };


  // Clear completed
  const clearCompleted = () => {
    const CompletedTasks = tasks.filter((t) => t.completed);

    if (CompletedTasks.length > 0) {
    setTasks(tasks.filter((t) => !t.completed));
    toast.success("Completedtask cleared!");
  } else {
    toast.info("No completed tasks to clear!")
  }
};

  // Export Tasks
  const exportTasks = () => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "my-tasks.json";
    link.click();
    toast.success("Tasks exported!");
  };

  // Add with Enter Key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") addTask();
  };

  // Voice Input
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognit
  const recognition = new SpeechRecognition();

  const startListening = () => {
    recognition.start();
    recognition.onresult = (event) => {
      const voiceTask = event.results[0][0].transcript;
      setTasks([...tasks, { id: Date.now(), text: voiceTask, completed: false }]);
    };
  };

  const formattedTime = time.toLocaleTimeString();
  const formattedDate = time.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });


  return (
    <div className={`App ${darkmode ? 'dark' : ''}`}>
      <div className="header">
        <h1>MY TODO APP</h1>
        <div className="left">
          <h2>{greeting} <span className="name">Yashashree</span></h2>
          <p className="datetime">
            {formattedDate} | {formattedTime}
          </p>
          <p className="streak">Streak: {streak} days</p>
        </div>
        <button
          className="mode-toggle"
          onClick={() => setDarkMode(!darkmode)}>
          {darkmode ? 'Light' : 'Dark'}
        </button>
      </div>

      <div className="quote-box">

        <p>{quote}</p>
      </div>



      <div className="todo-input">
        <input
          type="text"
          placeholder="Enter a new task.."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <input
        type="time"
        value={taskTime}
        onChange={(e) => setTaskTime(e.target.value)}
        />

        <button onClick={startListening}>Speak Task</button>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>


      
        <button onClick={addTask}>ADD</button>
      </div>

      <div className="todo-search">
        <input
          type="text"
          placeholder="Search tasks.."
          value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {total > 0 && (
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            <p className="progress-text">{progress}% completed ({completed}/{total})</p>
          </div>
        </div>
      )}

      <div className="todo-list">
        {tasks.length === 0 ? (
          <p>NO tasks yet - start adding some</p>
        ) : (
          tasks.filter((t) =>
            t.text && typeof t.text === 'string' &&
            t.text.toLowerCase().includes(search.toLowerCase()))
            .map((t) => (
              <motion.div
              key={t.id}
              className={`task-item ${t.completed ? "completed" : ""}`}
              initial={{opacity:0 , y:20}}
              animate={{opacity:1, y:0}}
              transition={{duration: 0.3}}
              >
                
                  
                {editID === t.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input" />
                    <div className="buttons">
                      <button
                        className="save-btn"
                        onClick={() => saveEdit(t.id)}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{t.text}</span>
                    <small>
                      Time{t.time || "No time"} | priority {t.priority}
                    </small>
                    <div className="buttons">
                      <button className="complete-btn" onClick={() => toggleComplete(t.id)}>

                        {t.completed ? 'Undo' : 'Done'}
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => startEdit(t.id, t.text)}
                      >
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => deleteTask(t.id)}>DELETE</button>
                    </div>

                  </>
                )}
                </motion.div>
              

            ))
        )}

      </div>
      <div className="bottom-buttons">
        <button onClick={clearCompleted}>Clear Completed</button>
        <button onClick={exportTasks}>Export</button>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );

};



export default App;