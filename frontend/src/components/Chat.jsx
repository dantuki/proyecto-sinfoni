import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = ({ usuario }) => {
  const [socket, setSocket] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [contactoActivo, setContactoActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  
  const contenedorMensajesRef = useRef(null);

  // 1. Inicializar conexión única del Socket al montar el componente
  useEffect(() => {
    const nuevoSocket = io('http://localhost:5000');
    setSocket(nuevoSocket);

    nuevoSocket.on('connect', () => {
      nuevoSocket.emit('registrar_usuario', usuario.id);
      nuevoSocket.emit('obtener_contactos', usuario.rol);
    });

    nuevoSocket.on('lista_contactos', (data) => {
      setContactos(data);
    });

    nuevoSocket.on('historial_mensajes', (data) => {
      setMensajes(data);
    });

    nuevoSocket.on('recibir_mensaje', (mensaje) => {
      setMensajes((prev) => {
        // Evitar duplicación en la misma ventana de conversación activa
        if (prev.some(m => m.id === mensaje.id)) return prev;
        return [...prev, mensaje];
      });
    });

    nuevoSocket.on('error_chat', (errMsg) => {
      alert(errMsg);
    });

    return () => nuevoSocket.disconnect();
  }, [usuario]);

  // 2. Hacer scroll automático al recibir o enviar un mensaje
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // 3. Cambiar de conversación e invocar el historial persistente de la BD
  const seleccionarContacto = (contacto) => {
    setContactoActivo(contacto);
    setMensajes([]);
    if (socket) {
      socket.emit('obtener_historial', {
        remitente_id: usuario.id,
        destinatario_id: contacto.id
      });
    }
  };

  // 4. Despachar mensaje por WebSocket
  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !contactoActivo || !socket) return;

    socket.emit('enviar_mensaje', {
      remitente_id: usuario.id,
      destinatario_id: contactoActivo.id,
      mensaje: nuevoMensaje
    });

    setNuevoMensaje('');
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 flex h-[calc(100vh-12rem)] overflow-hidden">
      
      {/* PANEL IZQUIERDO: LISTA DE CONTACTOS */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h3 className="font-bold text-slate-800 text-base">Mensajería Interna</h3>
          <p className="text-xs text-slate-400 mt-0.5">Sistemas de comunicación ArchiveX</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contactos.length === 0 ? (
            <p className="text-center text-xs text-slate-400 mt-6">Buscando destinatarios disponibles...</p>
          ) : (
            contactos.map((c) => (
              <div
                key={c.id}
                onClick={() => seleccionarContacto(c)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                  contactoActivo?.id === c.id
                    ? 'bg-[#5B9BD5] text-white shadow-sm font-medium'
                    : 'hover:bg-slate-100 text-slate-700 bg-white border border-slate-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 uppercase">
                  {c.nombre_completo.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.nombre_completo}</div>
                  <div className={`text-xs truncate ${contactoActivo?.id === c.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    Rol: {c.rol}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PANEL DERECHO: CONVERSACIÓN ACTIVA */}
      <div className="w-2/3 flex flex-col bg-white">
        {contactoActivo ? (
          <>
            {/* Cabecera del chat activo */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white shadow-sm z-10">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-[#5B9BD5] flex items-center justify-center font-bold text-sm uppercase">
                {contactoActivo.nombre_completo.substring(0, 2)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{contactoActivo.nombre_completo}</h4>
                <p className="text-xs text-emerald-500 font-medium">● Canal de chat activo</p>
              </div>
            </div>

            {/* Caja contenedora de burbujas de mensajes */}
            <div 
              ref={contenedorMensajesRef}
              className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30"
            >
              {mensajes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 bg-white border border-slate-100 inline-block px-3 py-1.5 rounded-full shadow-sm">
                    No hay mensajes previos. ¡Inicia la conversación!
                  </p>
                </div>
              ) : (
                mensajes.map((m) => {
                  const esMio = m.remitente_id === usuario.id;
                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md p-3.5 rounded-2xl shadow-xs text-sm ${
                        esMio 
                          ? 'bg-[#2d3748] text-white rounded-br-none' 
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.mensaje}</p>
                        <span className={`text-[10px] block text-right mt-1.5 ${esMio ? 'text-slate-300' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Barra inferior de entrada de texto */}
            <form 
              onSubmit={enviarMensaje}
              className="p-4 border-t border-slate-100 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje interno..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5B9BD5] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#5B9BD5] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Enviar 🚀
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 bg-slate-50/30">
            <span className="text-5xl">💬</span>
            <h4 className="font-bold text-slate-700 mt-4 text-sm">Bandeja de Comunicación Interna</h4>
            <p className="text-xs text-slate-400 text-center max-w-xs mt-1 leading-relaxed">
              Selecciona un miembro del personal académico a la izquierda para entablar una conversación en tiempo real.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;