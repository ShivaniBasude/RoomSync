/* ViewRooms.jsx — Reusable room list display */
import './ViewRooms.css'

const CAPACITY_LABELS = { 1: 'Single', 2: 'Double', 3: 'Triple', 4: 'Quad' }

export default function ViewRooms({ rooms = [], onEdit, onDelete, compact = false }) {
    if (rooms.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🏠</div>
                <p className="empty-state-text">No rooms found. Add a room to get started.</p>
            </div>
        )
    }

    return (
        <div className={`rooms-grid${compact ? ' rooms-grid--compact' : ''}`}>
            {rooms.map((room) => {
                const occupancyPct = room.capacity ? Math.round((room.occupied / room.capacity) * 100) : 0
                const isFull = room.occupied >= room.capacity
                const isEmpty = room.occupied === 0

                return (
                    <div key={room.id || room.room_number} className="room-card card fade-in">
                        <div className="room-card-header">
                            <div>
                                <p className="room-card-number">Room {room.room_number}</p>
                                <p className="room-card-type">
                                    {CAPACITY_LABELS[room.capacity] || `Capacity ${room.capacity}`}
                                </p>
                            </div>
                            <span className={`badge ${isFull ? 'badge-red' : isEmpty ? 'badge-ink' : 'badge-green'}`}>
                                {isFull ? 'Full' : isEmpty ? 'Vacant' : 'Available'}
                            </span>
                        </div>

                        <div className="room-card-body">
                            <div className="room-occupancy">
                                <div className="room-occupancy-track">
                                    <div
                                        className="room-occupancy-fill"
                                        style={{
                                            width: `${occupancyPct}%`,
                                            background: isFull ? 'var(--red)' : isEmpty ? 'var(--ink-muted)' : 'var(--teal)',
                                        }}
                                    />
                                </div>
                                <span className="room-occupancy-label">
                                    {room.occupied ?? 0} / {room.capacity} occupied
                                </span>
                            </div>

                            {room.floor && (
                                <p className="room-meta">Floor {room.floor}</p>
                            )}
                            {room.amenities && (
                                <p className="room-meta room-amenities">{room.amenities}</p>
                            )}
                        </div>

                        {(onEdit || onDelete) && (
                            <div className="room-card-actions">
                                {onEdit && (
                                    <button className="btn btn-outline btn-sm" onClick={() => onEdit(room)}>
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(room)}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}