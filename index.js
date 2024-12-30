// to use the paackage:
//voice-comment record filename 1 (line number)

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const recorder = require("node-record-lpcm16");
const player = require("play-sound")();

class VoiceComments {
  constructor() {
    this.audioDir = ".voice-notes";
    this.fileExtension = ".wav";
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir);
    }
  }

  async record() {
    const noteId = uuidv4();
    const filePath = path.join(this.audioDir, `${noteId}${this.fileExtension}`);

    console.log("🎤 Recording... Press Ctrl+C to stop.");

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);

      const recording = recorder.record({
        sampleRate: 44100,
        channels: 2,
        audioType: "wav",
      });

      recording.stream().pipe(fileStream);

      process.on("SIGINT", () => {
        recording.stop();
        fileStream.end();
        console.log("\n✅ Recording saved!");
        resolve(noteId);
      });
    });
  }

  async addNoteReference(filePath, lineNumber, noteId) {
    try {
      const content = fs.readFileSync(filePath, "utf8").split("\n");
      content.splice(lineNumber - 1, 0, `// @voice-note: ${noteId}`);
      fs.writeFileSync(filePath, content.join("\n"));
      return true;
    } catch (error) {
      console.error("Error adding note reference:", error);
      return false;
    }
  }

  async playNote(noteId) {
    const filePath = path.join(this.audioDir, `${noteId}${this.fileExtension}`);

    if (!fs.existsSync(filePath)) {
      console.error(`Voice note ${noteId} not found`);
      return false;
    }

    player.play(filePath, (err) => {
      if (err) console.error("Error playing audio:", err);
    });
  }
}

module.exports = VoiceComments;
