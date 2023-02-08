import { hashSync } from "bcryptjs"
import request from "supertest"
import { Connection, createConnection } from "typeorm"
import { v4 as uuidV4 } from "uuid"
import { app } from "../../../../app"

let connection: Connection
describe("Create Statement", () => {

  beforeAll(async() => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuidV4()
      const password = hashSync("admin", 8)

      await connection.query(
       `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'admin', 'admin@rentx.com', '${password}', 'now()', 'now()')
        `
      )
  })

  afterAll(async() => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able create a new deposit statement", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const {token} = responseToken.body

    const response =  await request(app).post("/api/v1/statements/deposit")
    .send({
      user_id: responseToken.body.user.id,
      type: "DEPOSIT",
      amount: 100,
      description: "New deposit"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
  })

  it("should be able create a new withdrawal statement", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const {token} = responseToken.body

    const response =  await request(app).post("/api/v1/statements/withdraw")
    .send({
      user_id: responseToken.body.user.id,
      type: "WITHDRAW",
      amount: 100,
      description: "New withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
  })

  it("should not be able create a new withdrawal statement with insufficient balance", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const {token} = responseToken.body

    const response =  await request(app).post("/api/v1/statements/withdraw")
    .send({
      user_id: responseToken.body.user.id,
      type: "WITHDRAW",
      amount: 100,
      description: "New withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
  })
})
