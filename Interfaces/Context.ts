import { Request, Response } from 'express'

export interface Context {
    session: {
        req: Request
        res: Response
    }
    user: {
        id: number
    }
}
