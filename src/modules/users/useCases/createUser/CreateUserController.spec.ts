import request from "supertest"
import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"


let connection: Connection
describe("Create User", () => {
  beforeAll(async() => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async() => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able create new user", async() => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test",
      email: "test@gg.com",
      password: "1234"
    })

    expect(response.status).toBe(201)
  })

  it("should not be able create new user if user already exist", async() => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Hello",
      email: "test@gg.com",
      password: "4321"
    })

    expect(response.status).toBe(400)
  })
})
