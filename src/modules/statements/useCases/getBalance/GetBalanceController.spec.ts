import { hashSync } from "bcryptjs"
import request from 'supertest'
import { Connection, createConnection } from "typeorm"
import { v4 as uuidV4 } from "uuid"
import { app } from "../../../../app"

let connection: Connection
describe("Get Balance", () => {
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

  it("should be able get balance", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const {token} = responseToken.body

    await request(app).post("/api/v1/statements/deposit")
    .send({
      user_id: responseToken.body.user.id,
      type: "DEPOSIT",
      amount: 100,
      description: "New deposit"
    }).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    })


    expect(response.status).toBe(200)
    expect(response.body.statement.length).toBe(1)
  })
})
