
function PassengerList({ passengers, onChange }) {
  const handleChange = (index, value) => {
    const updated = passengers.map((name, i) => (i === index ? value : name))
    onChange(updated)
  }

  const handleAdd = () => {
    onChange([...passengers, ''])
  }

  const handleRemove = (index) => {
    onChange(passengers.filter((_, i) => i !== index))
  }

  return (
    <div className="passenger-list">
      {passengers.length === 0 && (
        <p className="passenger-empty">No passengers added yet.</p>
      )}

      {passengers.map((name, index) => (
        <div className="passenger-row" key={index}>
          <span className="passenger-index">{index + 1}</span>
          <input
            className="form-control"
            type="text"
            placeholder={`Passenger ${index + 1} name`}
            value={name}
            onChange={(e) => handleChange(index, e.target.value)}
          />
          <div className="passenger-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAdd}
              aria-label="Add passenger"
              title="Add passenger"
            >
              ＋
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-danger"
              onClick={() => handleRemove(index)}
              aria-label="Remove passenger"
              title="Remove passenger"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {passengers.length === 0 && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAdd}
        >
          ＋ Add Passenger
        </button>
      )}
    </div>
  )
}

export default PassengerList
