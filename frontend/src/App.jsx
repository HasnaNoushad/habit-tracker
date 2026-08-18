import { useState, useEffect } from "react"
import "./App.css"

const API = "https://habit-tracker-jq9r.onrender.com"

function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token"))
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [completed, setCompleted] = useState({})
  const [habits, setHabits] = useState([])
  const [newHabit, setNewHabit] = useState("")
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const login = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch(`${API}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("access_token", data.access)
        setToken(data.access)
        setUsername("")
        setPassword("")
      } else {
        setError("Invalid username or password.")
      }
    } catch {
      setError("Couldn't connect to the server. Please try again.")
    }
  }

  const register = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch(`${API}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistering(false)
        setUsername("")
        setPassword("")
        setError("Registration successful! You can now log in ✦")
      } else {
        setError(
          data.username?.[0] ||
          data.password?.[0] ||
          "Registration failed."
        )
      }
    } catch {
      setError("Couldn't connect to the server. Please try again.")
    }
  }

  useEffect(() => {
    if (!token) return

    fetch(`${API}/api/habits/`, {
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

    fetch(`${API}/api/habit-logs/`, {
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
    const response = await fetch(`${API}/api/habit-logs/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const logs = await response.json()

    const existingLog = logs.find(
      (log) => log.habit === habitId && log.date === date
    )

    if (existingLog) {
      await fetch(`${API}/api/habit-logs/${existingLog.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_done: !existingLog.is_done
        })
      })
    } else {
      await fetch(`${API}/api/habit-logs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          habit: habitId,
          date,
          is_done: true
        })
      })
    }

    const key = `${habitId}-${date}`

    setCompleted((previous) => ({
      ...previous,
      [key]: !previous[key]
    }))
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-decoration decoration-one">✦</div>
        <div className="auth-decoration decoration-two">♡</div>

        <div className="login">
          <div className="auth-icon">
            {isRegistering ? "🌷" : "🪻"}
          </div>

          <p className="little-label">
            {isRegistering
              ? "A fresh little start"
              : "Your tiny daily space"}
          </p>

          <h1>
            {isRegistering
              ? "Create your account"
              : "My little habits"}
          </h1>

          <p className="auth-subtitle">
            {isRegistering
              ? "Start building small habits, one day at a time."
              : "Small steps. Soft progress. Better days."}
          </p>

          <form onSubmit={isRegistering ? register : login}>
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

            <button className="primary-button" type="submit">
              {isRegistering
                ? "Create account ✦"
                : "Let's begin ✦"}
            </button>

            {error && <p className="message">{error}</p>}
          </form>

          {isRegistering ? (
            <p className="switch-text">
              Already have an account?{" "}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setIsRegistering(false)
                  setError("")
                }}
              >
                Login
              </button>
            </p>
          ) : (
            <p className="switch-text">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setIsRegistering(true)
                  setError("")
                }}
              >
                Register
              </button>
            </p>
          )}
        </div>
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
    <div className="app-page">
      <div className="page-decoration decoration-three">✦</div>
      <div className="page-decoration decoration-four">♡</div>

      <header className="app-header">
        <p className="little-label">{getGreeting()} ✦</p>

        <p className="current-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        </p>

        <h1>Let's take care of you.</h1>

        <p className="subtitle">
          Little habits become lovely routines.
        </p>
      </header>

      <section className="habit-input-card">
        <div>
          <span className="card-icon">🌱</span>

          <div>
            <h2>Add a little habit</h2>
            <p>Something small you'd like to do today.</p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()

            if (!newHabit.trim()) return

            const response = await fetch(`${API}/api/habits/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                name: newHabit
              })
            })

            const data = await response.json()

            if (response.ok) {
              setHabits([...habits, data])
              setNewHabit("")
            }
          }}
        >
          <input
            type="text"
            placeholder="e.g. Read 10 pages"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />

          <button type="submit" className="add-button">
            Add habit ✦
          </button>
        </form>
      </section>

      <div className="top-actions">
        <span>
          {habits.length === 0
            ? "Your little routine starts here 🌷"
            : `${habits.length} habit${
                habits.length === 1 ? "" : "s"
              } this week`}
        </span>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("access_token")
            setToken(null)
          }}
        >
          Log out
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🪻</div>

          <h2>A blank little canvas</h2>

          <p>
            Add your first habit above and start filling your week with ✦.
          </p>
        </div>
      ) : (
        <section className="habit-board">
          <div className="board-heading">
            <div>
              <p className="little-label">This week</p>
              <h2>Your tiny wins</h2>
            </div>

            <span className="week-decoration">
              ♡ ✦ ♡
            </span>
          </div>

          <div className="table-wrapper">
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
                    <td className="habit-name">
                      {habit.name}
                    </td>

                    {days.map((day) => {
                      const date = day
                        .toISOString()
                        .split("T")[0]

                      const key = `${habit.id}-${date}`

                      return (
                        <td
                          key={date}
                          className={`habit-cell ${
                            completed[key] ? "completed" : ""
                          }`}
                          onClick={() =>
                            toggleHabit(habit.id, date)
                          }
                        >
                          {completed[key] ? "✦" : "○"}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="board-footer">
            ✦ Every little check counts.
          </p>
        </section>
      )}

      <footer>
        Made for small steps & soft progress ♡
      </footer>
    </div>
  )
}

export default App