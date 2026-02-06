import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export const sendText = (text, language, user_id) =>
  api.post("/api/process_text", {
    text,
    language,
    user_id,
  });

export const sendAudio = (audioBlob, language, user_id) => {
  const form = new FormData();
  form.append("audio", audioBlob);
  form.append("language", language);
  form.append("user_id", user_id);

  return api.post("/api/process_audio", form);
};
