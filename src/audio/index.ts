import voiceProfilesJson from "./voiceProfiles.json";

export interface VoiceProfile {
  id: string;
  label: string;
  engine: string;
  voice: string;
  rate: string;
  pitch?: string;
  sample?: string;
  bestFor: string;
  default?: boolean;
}

export const VOICE_PROFILES = voiceProfilesJson.profiles as VoiceProfile[];

export const DEFAULT_VOICE_PROFILE =
  VOICE_PROFILES.find((profile) => profile.default) ?? VOICE_PROFILES[0];
