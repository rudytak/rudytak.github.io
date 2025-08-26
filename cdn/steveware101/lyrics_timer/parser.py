# from pytube import YouTube as YT
import syncedlyrics
from moviepy.editor import VideoFileClip
import os
from datetime import datetime
import textwrap

VID_SAVE_DIR = "./vid/"
AUDIO_SAVE_DIR = "./sound/"
XML_SAVE_DIR = "./lyrics/"
    
# def download_mp4(link):
#     os.makedirs(VID_SAVE_DIR, exist_ok=True)
#     yt = YT(link)
#     yt.streams.first().download(VID_SAVE_DIR)
    
#     return VID_SAVE_DIR + yt.title + ".mp4"
    
def get_mp3(vid_dir):
    os.makedirs(AUDIO_SAVE_DIR, exist_ok=True)
    
    vid_dir = VID_SAVE_DIR + vid_dir + ".mp4"
    audio_dir = vid_dir.replace(".mp4", "_audio.mp3").replace(VID_SAVE_DIR, AUDIO_SAVE_DIR)

    # Load the video clip
    video_clip = VideoFileClip(vid_dir)

    # Extract the audio from the video clip
    audio_clip = video_clip.audio

    # Write the audio to a separate file
    audio_clip.write_audiofile(audio_dir)

    # Close the video and audio clips
    audio_clip.close()
    video_clip.close()
    
def generate_XML(artist, song_name, first_word_time):
    os.makedirs(XML_SAVE_DIR, exist_ok=True)
        
    lrc = syncedlyrics.search(f"{song_name} {artist}")
    lrc = lrc.split("\n")
    
    def parse_timed_lyric(lyr):
        t = datetime.strptime(lyr.split("] ")[0].split("[")[1], "%M:%S.%f")
        return (60*t.minute + t.second + t.microsecond / 1e6, lyr.split("] ")[1])
    
    lrc = list(map(parse_timed_lyric, lrc))
    
    xml = ""
    
    timing_discrepancy = first_word_time - lrc[0][0]
    
    xml += f"""<?xml version="1.0" encoding="iso-8859-1" ?>
<Karaoke xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <Pages>
    
        <Page>
            <PresentTime>0.0100</PresentTime>
            <StartTime>0.0100</StartTime>
            <ClearTime>{lrc[0][0] + timing_discrepancy:.4f}</ClearTime>
            <EndTime>{lrc[0][0] + timing_discrepancy:.4f}</EndTime>
            <Paragraphs />
            <Type>Title</Type>
        </Page>
    """

    for i in range(len(lrc) - 1):
        start_time = max(lrc[i][0] + timing_discrepancy, 0)
        end_time = max(lrc[i+1][0] + timing_discrepancy, 0)
        
        text_full = lrc[i][1]
        lines = textwrap.wrap(text_full, 24, break_long_words=False)
        
        xml += f"""
        <Page>
            <PresentTime>{start_time:.4f}</PresentTime>
            <StartTime>{start_time:.4f}</StartTime>
            <ClearTime>{end_time:.4f}</ClearTime>
            <EndTime>{end_time:.4f}</EndTime>
            <Paragraphs>
                <Block xsi:type="TextBlock">
                    <Lines>
        """
        
        for i in range(len(lines)):
            l = lines[i]
            
            dur = end_time - start_time
            h_start = start_time + dur/len(lines) * i
            h_end = start_time + dur/len(lines) * (i+1)
            
            xml += f"""
                            <Line>
                                <Text>{l}</Text>
                                <Highlights>
                                    <Highlight>
                                        <Character>0</Character>
                                        <Time>{h_start:.4f}</Time>
                                        <Type>Empty</Type>
                                    </Highlight>
                                    <Highlight>
                                        <Character>{len(l)}</Character>
                                        <Time>{h_end:.4f}</Time>
                                        <Type>Full</Type>
                                    </Highlight>
                                </Highlights>
                                <Voice>0</Voice>
                            </Line>
            """

        xml+= """
                        </Lines>
                    </Block>
                </Paragraphs>
                <Type>Lyrics</Type>
            </Page>
        """
    
    xml += f"""
    </Pages>
    <Artist>{artist}</Artist>
    <Copyright></Copyright>
    <Title>{song_name}</Title>
    <Writers></Writers>
</Karaoke>
    """
    
    with open(f"{XML_SAVE_DIR}{artist}_{song_name}.xml", "w") as f:
        f.write(xml)
    
if __name__ == "__main__":
    os.makedirs(VID_SAVE_DIR, exist_ok=True)

    artist = input("Input the author: ")
    song_name = input("Input the song name: ")
    song_link = input("Input the song name (it has to be located in the 'vid' folder): ")
    first_word_time = float(input("Input the time that the first word in the lyrics starts at (necessary for time syncing): "))
    
    # artist = "Eminem"
    # song_name = "Lose Yourself"
    # song_link = "https://www.youtube.com/watch?v=xFYQQPAOz7Y"
    # first_word_time = 33

    get_mp3(song_link)
    generate_XML(artist, song_name, first_word_time)
