import * as ImagePicker from "expo-image-picker";

export type PickPhotoResult =
  | { status: "picked"; uri: string }
  | { status: "cancelled" }
  | { status: "denied" };

/** Asks for library access and returns a square-cropped photo URI. */
export async function pickSquarePhoto(): Promise<PickPhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: "denied" };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return { status: "cancelled" };
  return { status: "picked", uri: result.assets[0].uri };
}
