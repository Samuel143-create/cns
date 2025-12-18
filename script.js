function toggleChat() {
  const chat = document.getElementById("chatbot");
  chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

async function enviar() {
  const input = document.getElementById("chat-input");
  const mensajes = document.getElementById("chat-messages");
  const texto = input.value.trim();
  if (!texto) return;

  mensajes.innerHTML += `<div><b>Tú:</b> ${texto}</div>`;
  input.value = "";

  mensajes.innerHTML += `<div id="pensando">🤖 Pensando...</div>`;

  try {
    const res = await fetch("https://TU-BACKEND.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: texto })
    });

    const data = await res.json();
    document.getElementById("pensando").remove();
    mensajes.innerHTML += `<div><b>Asistente:</b> ${data.reply}</div>`;
    mensajes.scrollTop = mensajes.scrollHeight;

  } catch (e) {
    document.getElementById("pensando").innerText =
      "❌ Error al conectar con el servidor";
  }
}
