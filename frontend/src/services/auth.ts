export const loginUser = async (
  email: string,
  password: string
) => {
  return new Promise<{ token: string }>((resolve, reject) => {
    setTimeout(() => {
      if (email === "test@reachinbox.ai" && password === "password") {
        resolve({ token: "fake-jwt-token" })
      } else {
        reject(new Error("Invalid email or password"))
      }
    }, 800)
  })
}
