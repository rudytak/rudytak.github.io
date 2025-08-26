from pytesseract import pytesseract
from thefuzz import fuzz

# https://github.com/pytube/pytube/issues/1750#issuecomment-1672185669
from pytube import YouTube as YT
import os
from moviepy.editor import VideoFileClip
import cv2
import glob
import requests
import json
import syncedlyrics

pytesseract.tesseract_cmd = "C:/Program Files/Tesseract-OCR/tesseract.exe"

class lyrics:
    VID_SAVE_DIR = "./vid/"
    AUDIO_SAVE_DIR = "./sound/"
    FRAME_FREQ = 5

    def __init__(self, yt_source, artist, song_name) -> None:
        self.yt_link = yt_source
        self.yt_title = ""
        self.artist = artist
        self.song_name = song_name
        self.fps = 30

        self.true_lyrics = ""
        self.get_lyrics()

        self.vid_dir = ""
        self.download_vid()

        self.audio_dir = ""
        self.get_audio()

        self.frame_texts = []
        self.extract_frame_text()

        self.timings = []
        self.generate_timings()

    def get_lyrics(self):
        res = requests.get(f"https://api.lyrics.ovh/v1/{self.artist}/{self.song_name}")
        response = json.loads(res.text)

        self.true_lyrics = (
            response["lyrics"]
            .replace("\r\n", "\n")
            .replace("\n\n", "\n")
            .replace("\n\n", "\n")
            .replace("\n\n", "\n")
        )

    def download_vid(self):
        yt = YT(self.yt_link)
        self.yt_title = yt.title
        self.vid_dir = lyrics.VID_SAVE_DIR + yt.title + ".mp4"

        if not os.path.exists(lyrics.VID_SAVE_DIR):
            os.makedirs(lyrics.VID_SAVE_DIR)

        if not os.path.exists(self.vid_dir):
            stream = yt.streams.first()
            stream.download(lyrics.VID_SAVE_DIR)
            self.fps = stream.fps
        else:
            print("Video already downloaded")
            return

    def get_audio(self):
        # Define the input video file and output audio file
        self.audio_dir = lyrics.AUDIO_SAVE_DIR + self.yt_title + "_audio.mp3"
        if os.path.exists(self.audio_dir):
            print("Audio already downloaded")
            return

        if not os.path.exists(lyrics.AUDIO_SAVE_DIR):
            os.makedirs(lyrics.AUDIO_SAVE_DIR)

        # Load the video clip
        video_clip = VideoFileClip(self.vid_dir)

        # Extract the audio from the video clip
        audio_clip = video_clip.audio

        # Write the audio to a separate file
        audio_clip.write_audiofile(self.audio_dir)

        # Close the video and audio clips
        audio_clip.close()
        video_clip.close()

    def extract_frame_text(self):
        vidcap = cv2.VideoCapture(self.vid_dir)
        os.makedirs(f"./frames/{self.artist}_{self.song_name}", exist_ok=True)

        success, image = vidcap.read()
        count = 0
        while success:
            cv2.imwrite(
                f"./frames/{self.artist}_{self.song_name}/frame{count}.jpg", image
            )  # save frame as JPEG file
            success, image = vidcap.read()

            count += 1
            if count % 100 == 0:
                print(f"Frame {count} loaded")

        frame_dirs = glob.glob(f"./frames/{self.artist}_{self.song_name}/*.jpg")
        self.frame_texts = []
        count = 0
        while count < frame_dirs.__len__():
            if not os.path.exists(
                f"./frames/{self.artist}_{self.song_name}/frame{count}.txt"
            ):
                with open(
                    f"./frames/{self.artist}_{self.song_name}/frame{count}.txt", "wb"
                ) as f:
                    image = cv2.imread(
                        f"./frames/{self.artist}_{self.song_name}/frame{count}.jpg"
                    )
                    text = pytesseract.image_to_string(image)
                    f.write(text.encode("utf8"))

                    self.frame_texts.append(text)
            else:
                with open(
                    f"./frames/{self.artist}_{self.song_name}/frame{count}.txt",
                    "r",
                    encoding="utf8",
                ) as f:
                    text = f.read()
                    self.frame_texts.append(text)

            count += lyrics.FRAME_FREQ
            if count % 100 == 0:
                print(f"Frame text {count} parsed")

    def generate_timings(self):
        print()