/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *       additionalProperties: true
 *     FormStatus:
 *       type: string
 *       enum: [draft, published, closed, archived]
 *     QuestionType:
 *       type: string
 *       enum: [text, number, email, select, radio, checkbox]
 *     Form:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ownerId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         status:
 *           $ref: '#/components/schemas/FormStatus'
 *         publicId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required: [id, ownerId, title, status, publicId, createdAt]
 *     QuestionOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         questionId:
 *           type: string
 *           format: uuid
 *         label:
 *           type: string
 *         orderIndex:
 *           type: integer
 *           minimum: 0
 *       required: [id, questionId, label, orderIndex]
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         formId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         type:
 *           $ref: '#/components/schemas/QuestionType'
 *         required:
 *           type: boolean
 *         orderIndex:
 *           type: integer
 *           minimum: 0
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionOption'
 *       required: [id, formId, title, type, required, orderIndex]
 *     Response:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         formId:
 *           type: string
 *           format: uuid
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         completionMs:
 *           type: integer
 *           nullable: true
 *         ipHash:
 *           type: string
 *           nullable: true
 *         userAgent:
 *           type: string
 *           nullable: true
 *       required: [id, formId, submittedAt]
 *     Answer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         responseId:
 *           type: string
 *           format: uuid
 *         questionId:
 *           type: string
 *           format: uuid
 *         optionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         value:
 *           type: string
 *           nullable: true
 *       required: [id, responseId, questionId]
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *       required: [id]
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *       required: [id]
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         providerId:
 *           type: string
 *       required: [id, providerId]
 *     Verification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         identifier:
 *           type: string
 *       required: [id, identifier]
 *     CreateFormRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *       additionalProperties: false
 *     UpdateFormRequest:
 *       $ref: '#/components/schemas/CreateFormRequest'
 *     CreateQuestionRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           $ref: '#/components/schemas/QuestionType'
 *         required:
 *           type: boolean
 *         orderIndex:
 *           type: integer
 *           minimum: 0
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *                 minimum: 0
 *             required: [label, orderIndex]
 *       required: [title, type, orderIndex]
 *       additionalProperties: false
 *     UpdateQuestionRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         required:
 *           type: boolean
 *       additionalProperties: false
 *     CreateOptionRequest:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *         orderIndex:
 *           type: integer
 *           minimum: 0
 *       required: [label, orderIndex]
 *       additionalProperties: false
 *     UpdateOptionRequest:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *         orderIndex:
 *           type: integer
 *           minimum: 0
 *       additionalProperties: false
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       '200':
 *         description: API is running
 * /api/v1/forms:
 *   post:
 *     tags: [Forms]
 *     summary: Create a form
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFormRequest'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 form:
 *                   $ref: '#/components/schemas/Form'
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized
 *   get:
 *     tags: [Forms]
 *     summary: List forms for the current user
 *     responses:
 *       '200':
 *         description: Forms list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 forms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Form'
 *       '401':
 *         description: Unauthorized
 * /api/v1/forms/{id}:
 *   get:
 *     tags: [Forms]
 *     summary: Get one form and its questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Form payload
 *       '404':
 *         description: Form not found
 *   patch:
 *     tags: [Forms]
 *     summary: Update form metadata
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFormRequest'
 *     responses:
 *       '200':
 *         description: Updated form
 *       '404':
 *         description: Form not found
 *   delete:
 *     tags: [Forms]
 *     summary: Delete a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Deleted
 *       '404':
 *         description: Form not found
 * /api/v1/forms/{id}/duplicate:
 *   post:
 *     tags: [Forms]
 *     summary: Duplicate a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '201':
 *         description: Duplicated
 *       '404':
 *         description: Form not found
 * /api/v1/forms/{id}/questions:
 *   post:
 *     tags: [Questions]
 *     summary: Create a question inside a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *     responses:
 *       '201':
 *         description: Created question
 *       '400':
 *         description: Invalid request body
 *       '404':
 *         description: Form not found
 * /api/v1/forms/{id}/questions/reorder:
 *   patch:
 *     tags: [Questions]
 *     summary: Reorder questions inside a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     orderIndex:
 *                       type: integer
 *                       minimum: 0
 *                   required: [id, orderIndex]
 *             required: [questions]
 *             additionalProperties: false
 *     responses:
 *       '200':
 *         description: Questions reordered successfully
 *       '400':
 *         description: Invalid questions payload
 *       '404':
 *         description: Form not found
 * /api/v1/questions/{questionId}:
 *   patch:
 *     tags: [Questions]
 *     summary: Update a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       '200':
 *         description: Updated question
 *       '400':
 *         description: Invalid request body
 *       '404':
 *         description: Question not found
 *   delete:
 *     tags: [Questions]
 *     summary: Delete a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Deleted
 *       '404':
 *         description: Question not found
 * /api/v1/questions/{questionId}/options:
 *   post:
 *     tags: [Questions]
 *     summary: Add an option to a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOptionRequest'
 *     responses:
 *       '201':
 *         description: Created option
 *       '400':
 *         description: Invalid request body
 *       '404':
 *         description: Question not found
 * /api/v1/options/{optionId}:
 *   patch:
 *     tags: [Options]
 *     summary: Update an option
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOptionRequest'
 *     responses:
 *       '200':
 *         description: Updated option
 *       '400':
 *         description: Invalid request body
 *       '404':
 *         description: Option not found
 *   delete:
 *     tags: [Options]
 *     summary: Delete an option
 *     parameters:
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Deleted
 *       '404':
 *         description: Option not found
 */
export const openApiDocs = true;
