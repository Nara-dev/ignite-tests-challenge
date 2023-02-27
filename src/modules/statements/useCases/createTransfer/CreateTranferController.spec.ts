import { hashSync } from "bcryptjs"
import request from "supertest"
import { Connection, createConnection } from "typeorm"
import { v4 as uuidV4 } from "uuid"
import { app } from "../../../../app"

let connection: Connection
describe("Create Transfer", () => {

  beforeAll(async() => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuidV4()
    const sender_id = uuidV4()
    const password = hashSync("admin", 8)
    const pass_sender_user = hashSync("1234", 8)

      await connection.query(
       `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'admin', 'admin@rentx.com', '${password}', 'now()', 'now()')
        `
      )

      await connection.query(
        `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
         values('${sender_id}', 'Hello', 'testes@rentx.com', '${pass_sender_user}', 'now()', 'now()')
         `
       )
  })

  afterAll(async() => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able create a new transfer statement", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const sender_user = await request(app).post("/api/v1/sessions").send({
      email: "testes@rentx.com",
      password: "1234"
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


    const response =  await request(app).post("/api/v1/statements/transfer")
    .send({
      user_id: responseToken.body.user.id,
      sender_id: sender_user.body.user.id,
      type: "TRANSFER",
      amount: 90,
      description: "New transfer"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
  })

  it("should not be able create a new transfer statement with sender user not found", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const {token} = responseToken.body

    const response =  await request(app).post("/api/v1/statements/transfer")
    .send({
      user_id: responseToken.body.user.id,
      sender_id: uuidV4(),
      type: "TRANSFER",
      amount: 100,
      description: "New transfer"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  })

  it("should not be able create a new transfer statement with insufficient balance", async() => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com",
      password: "admin"
    })

    const sender_user = await request(app).post("/api/v1/sessions").send({
      email: "testes@rentx.com",
      password: "1234"
    })

    const {token} = responseToken.body

    const response =  await request(app).post("/api/v1/statements/transfer")
    .send({
      user_id: responseToken.body.user.id,
      sender_id: sender_user.body.user.id,
      type: "TRANSFER",
      amount: 100,
      description: "New transfer"
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
  })
})
