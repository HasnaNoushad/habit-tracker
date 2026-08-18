import { useState, useEffect } from "react"
import "./App.css"

function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token"))
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [completed, setCompleted] = useState({})
  const [habits, setHabits] = useState([])
  const [newHabit, setNewHabit] = useState("")
  const [error, setError] = useState("")

  const login = async (e) => {
    e.preventDefault()
    setError("")

    const response = await fetch(
      "http://127.0.0.1:8000/api/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      }
    )

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("access_token", data.access)
      setToken(data.access)
    } else {
      setError("Invalid username or password")
    }
  }

  useEffect(() => {
  if (!token) return

  fetch("http://127.0.0.1:8000/api/habits/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(async (response) => {
      if (response.status === 401) {
        localStorage.removeItem("access_token")
        setToken(null)
        return null
      }

      return response.json()
    })
    .then((data) => {
      if (data) {
        setHabits(data)
      }
    })
}, [token])
 useEffect(() => {
  if (!token) return

  fetch("http://127.0.0.1:8000/api/habit-logs/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(async (response) => {
      if (response.status === 401) {
        localStorage.removeItem("access_token")
        setToken(null)
        return null
      }

      return response.json()
    })
    .then((logs) => {
      if (!logs) return

      const savedCompleted = {}

      logs.forEach((log) => {
        if (log.is_done) {
          const key = `${log.habit}-${log.date}`
          savedCompleted[key] = true
        }
      })

      setCompleted(savedCompleted)
    })
}, [token])

  const toggleHabit = async (habitId, date) => {
    const response = await fetch(
      "http://127.0.0.1:8000/api/habit-logs/",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const logs = await response.json()

    const existingLog = logs.find(
      (log) => log.habit === habitId && log.date === date
    )

    if (existingLog) {
      await fetch(
        `http://127.0.0.1:8000/api/habit-logs/${existingLog.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            is_done: !existingLog.is_done
          })
        }
      )
    } else {
      await fetch(
        "http://127.0.0.1:8000/api/habit-logs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            habit: habitId,
            date: date,
            is_done: true
          })
        }
      )
    }

    const key = `${habitId}-${date}`

    setCompleted({
      ...completed,
      [key]: !completed[key]
    })
  }

  if (!token) {
    return (
      <div className="login">
        <h1>Habit Tracker</h1>

        <form onSubmit={login}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>

          {error && <p>{error}</p>}
        </form>
      </div>
    )
  }

  const days = []

  const today = new Date()
  const monday = new Date(today)

  monday.setDate(today.getDate() - today.getDay() + 1)

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push(date)
  }

  return (
    <div>
      <h1>Habit Tracker</h1>

      <form
  onSubmit={async (e) => {
    e.preventDefault()

    if (!newHabit.trim()) return

    const response = await fetch(
      "http://127.0.0.1:8000/api/habits/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newHabit
        })
      }
    )

    const data = await response.json()

    if (response.ok) {
      setHabits([...habits, data])
      setNewHabit("")
    }
  }}
>
  <input
    type="text"
    placeholder="Enter a new habit"
    value={newHabit}
    onChange={(e) => setNewHabit(e.target.value)}
  />

  <button type="submit">Add Habit</button>
</form>

      <button
        onClick={() => {
          localStorage.removeItem("access_token")
          setToken(null)
        }}
      >
        Logout
      </button>

      <table>
        <thead>
          <tr>
            <th>Habit</th>

            {days.map((day) => (
              <th key={day.toISOString()}>
                {day.toLocaleDateString("en-US", {
                  weekday: "short"
                })}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id}>
              <td>{habit.name}</td>

              {days.map((day) => {
                const date = day.toISOString().split("T")[0]
                const key = `${habit.id}-${date}`

                return (
                  <td
                    key={date}
                    onClick={() => toggleHabit(habit.id, date)}
                  >
                    {completed[key] ? "✅" : "○"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App