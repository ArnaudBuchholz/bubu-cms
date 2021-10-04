const files: Record<string, string> = {}

export async function readTextFile (path: string): Promise<string> {
  return files[path]
}

readTextFile.set = (path: string, content: string): void => {
  files[path] = content
}
