import { useState, useEffect, useRef } from 'react';
import { Play, Square, LogOut, MapPin, Clock } from 'lucide-react';

export default function Tracker({ userPhone, onLogout }) {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [locationError, setLocationError] = useState('');
  const [lastLocation, setLastLocation] = useState(null);
  const [taskDetails, setTaskDetails] = useState({
    startTime: null,
    endTime: null,
    startLocation: null,
    endLocation: null,
  });

  const intervalRef = useRef(null);

  // Load state on mount if page was refreshed
  useEffect(() => {
    const activeTask = localStorage.getItem('geo_tracker_active_task');
    if (activeTask) {
      const taskData = JSON.parse(activeTask);
      const startTime = new Date(taskData.startTime).getTime();
      const now = new Date().getTime();
      
      setIsTracking(true);
      setElapsedSeconds(Math.floor((now - startTime) / 1000));
      setTaskDetails(prev => ({
        ...prev,
        startTime: new Date(taskData.startTime),
        startLocation: { lat: taskData.startLat, lng: taskData.startLng }
      }));
      
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  const formatHourMinute = (dateObj) => {
    if (!dateObj) return '--:--';
    const h = dateObj.getHours().toString().padStart(2, '0');
    const m = dateObj.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por el navegador.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => {
          let msg = 'Error al obtener ubicación.';
          if (error.code === 1) msg = 'Permiso de ubicación denegado.';
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleStartTask = async () => {
    setLocationError('');
    try {
      const coords = await getCurrentLocation();
      const startDate = new Date();
      
      const startLoc = { lat: coords.latitude, lng: coords.longitude };
      
      setTaskDetails({
        startTime: startDate,
        endTime: null, // Reset previous end time
        startLocation: startLoc,
        endLocation: null, // Reset previous end location
      });
      
      // Save state to survive reloads
      localStorage.setItem('geo_tracker_active_task', JSON.stringify({
        startTime: startDate.toISOString(),
        startLat: coords.latitude,
        startLng: coords.longitude
      }));

      setIsTracking(true);
      setElapsedSeconds(0);
      
      // Clear interval just in case before starting a new one
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setLocationError(err.message);
    }
  };

  const handleEndTask = async () => {
    setLocationError('');
    try {
      const coords = await getCurrentLocation();
      const endDate = new Date();
      const endLoc = { lat: coords.latitude, lng: coords.longitude };
      
      // Stop timer securely
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsTracking(false);
      
      setTaskDetails(prev => ({
        ...prev,
        endTime: endDate,
        endLocation: endLoc
      }));
      
      const finalPayload = {
        userPhone,
        totalTimeSeconds: elapsedSeconds,
        startTime: taskDetails.startTime ? taskDetails.startTime.toISOString() : null,
        startLocation: taskDetails.startLocation,
        endTime: endDate.toISOString(),
        endLocation: endLoc
      };
      
      // Here you would typically send data to a backend
      console.log('Task Finished! Payload para la BBDD:', finalPayload);

      // Clear local state
      localStorage.removeItem('geo_tracker_active_task');
      
    } catch (err) {
      setLocationError(err.message + ' (Ignorando para finalizar tarea)');
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsTracking(false);
      localStorage.removeItem('geo_tracker_active_task');
    }
  };

  return (
    <div className="glass-panel fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{userPhone}</h2>
        </div>
        <button 
          onClick={onLogout} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
          disabled={isTracking}
          title={isTracking ? "Finaliza la tarea antes de salir" : "Cerrar sesión"}
        >
          <LogOut size={24} />
        </button>
      </div>

      <div className="text-center mb-8">
        <div style={{ 
          fontSize: '4rem', 
          fontWeight: '700', 
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-1px',
          color: isTracking ? 'var(--success)' : 'var(--text-main)',
          textShadow: isTracking ? '0 0 20px var(--success-glow)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Clock size={16} />
          <span>Tiempo transcurrido</span>
        </div>
      </div>

      {locationError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.9rem' }}>
          {locationError}
        </div>
      )}

      <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Detalles de la Tarea</h3>
        
        {/* Start Info */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--success)' }}>
            <Play size={14} /> <span style={{ fontWeight: '600' }}>Inicio: {formatHourMinute(taskDetails.startTime)}</span>
          </div>
          {taskDetails.startLocation ? (
            <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', marginLeft: '1.5rem' }}>
              Lat: {taskDetails.startLocation.lat.toFixed(5)}<br/>
              Lng: {taskDetails.startLocation.lng.toFixed(5)}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', marginLeft: '1.5rem' }}>Esperando inicio...</div>
          )}
        </div>

        {/* End Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--danger)' }}>
            <Square size={14} /> <span style={{ fontWeight: '600' }}>Fin: {formatHourMinute(taskDetails.endTime)}</span>
          </div>
          {taskDetails.endLocation ? (
            <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', marginLeft: '1.5rem' }}>
              Lat: {taskDetails.endLocation.lat.toFixed(5)}<br/>
              Lng: {taskDetails.endLocation.lng.toFixed(5)}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', marginLeft: '1.5rem' }}>En curso...</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isTracking ? (
          <button onClick={handleStartTask} className="btn btn-success pulse">
            <Play size={20} fill="currentColor" />
            <span>Iniciar Tarea</span>
          </button>
        ) : (
          <button onClick={handleEndTask} className="btn btn-danger pulse">
            <Square size={20} fill="currentColor" />
            <span>Finalizar Tarea</span>
          </button>
        )}
      </div>
    </div>
  );
}
