# Third-Party Notices

This project contains adapted metadata, terminology, documentation and font files derived from Huashu Art Motion (MIT) plus its SIL OFL font collection.

## Upstream projects

### 1. Huashu Art Motion

- Repository: https://github.com/alchaincyf/huashu-art-motion
- Copyright: Copyright (c) 2026 alchaincyf (花叔 · 花生)
- License: MIT

Used for: the 8 colour palettes, 36 full implemented style cards and 9 full animation-grammar cards imported into `docs/reference/huashu/`, plus the condensed index in `src/library/catalog.json`. No sample films, overview images, character artwork or upstream Canvas renderer code is redistributed.

### 2. Huashu OFL fonts

- Source: `scripts/engine/lib/fonts/` in Huashu Art Motion
- License: SIL Open Font License 1.1
- Local copy: `public/fonts/huashu/`

The fonts are not covered by the MIT license. Their complete copyright list is in `public/fonts/huashu/LICENSES.md`, and the license text is in `public/fonts/huashu/OFL.txt`.

## Voice sample

`public/audio/voice-sample.mp3` was generated locally with Microsoft Edge TTS (`zh-CN-XiaoxiaoNeural`, `+15%`). It is a neutral demonstration clip only. The repository does not bundle the `edge-tts` package. Confirm Microsoft service terms before commercial use or redistribution.

## Scope

- The catalog in `src/library/catalog.json` is an adapted, condensed index, not a copy of the upstream repositories.
- All Remotion components in `src/packaging/` (including `CameraRig`, `KineticType` and `StyleTexture`) are original implementations written for this project.
- Upstream media files (MP4, GIF, overview images, character artwork, audio and engine source) are not included in this repository.
- The SIL OFL font files are included under `public/fonts/huashu/` with their own license files.

## MIT License

The following license text applies to the upstream material listed above.

```text
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The upstream project retains its own copyright line, reproduced above.
