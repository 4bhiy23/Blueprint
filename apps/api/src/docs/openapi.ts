/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 *         issues:
 *           type: object
 *           additionalProperties: true
 *     HealthCheck:
 *       type: object
 *       required: [status, name, uptimeSeconds, timestamp]
 *       properties:
 *         status:
 *           type: string
 *           enum: [ok, degraded]
 *         name:
 *           type: string
 *           example: Blueprint API
 *         uptimeSeconds:
 *           type: integer
 *           minimum: 0
 *         timestamp:
 *           type: string
 *           format: date-time
 *         checks:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *               enum: [ok, unavailable]
 *     FormStatus:
 *       type: string
 *       enum: [draft, published, closed, archived]
 *     QuestionType:
 *       type: string
 *       enum: [text, number, email, select, radio, checkbox, paragraph, date, datetime, time, rating]
 *     Form:
 *       type: object
 *       required: [id, ownerId, title, status, publicId, createdAt]
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
 *         firstQuestionId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         builderViewport:
 *           type: object
 *           nullable: true
 *           additionalProperties: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *     QuestionOption:
 *       type: object
 *       required: [id, questionId, label, orderIndex]
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
 *     Question:
 *       type: object
 *       required: [id, formId, title, type, required, orderIndex, options]
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
 *         positionX:
 *           type: number
 *         positionY:
 *           type: number
 *         ratingMax:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *           description: Maximum selectable value for rating questions; ratings always start at 1.
 *         ratingLowLabel:
 *           type: string
 *           nullable: true
 *           description: Optional label shown at the low end of a rating question.
 *         ratingHighLabel:
 *           type: string
 *           nullable: true
 *           description: Optional label shown at the high end of a rating question.
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionOption'
 *     PublicForm:
 *       type: object
 *       required: [id, publicId, title]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         publicId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *     PublicQuestionOption:
 *       type: object
 *       required: [id, label]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         label:
 *           type: string
 *     PublicQuestion:
 *       type: object
 *       required: [id, title, type, required, options]
 *       properties:
 *         id:
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
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PublicQuestionOption'
 *         ratingMax:
 *           type: integer
 *           minimum: 1
 *           default: 5
 *           description: Present for all questions; used only when type is rating.
 *         ratingLowLabel:
 *           type: string
 *           default: ''
 *         ratingHighLabel:
 *           type: string
 *           default: ''
 *     BuilderPosition:
 *       type: object
 *       required: [x, y]
 *       properties:
 *         x:
 *           type: number
 *         y:
 *           type: number
 *     BuilderOption:
 *       type: object
 *       required: [id, label]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         label:
 *           type: string
 *     BuilderNodeData:
 *       type: object
 *       required: [title]
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           default: ''
 *         required:
 *           type: boolean
 *           default: false
 *         options:
 *           type: array
 *           default: []
 *           items:
 *             $ref: '#/components/schemas/BuilderOption'
 *         ratingMax:
 *           type: integer
 *           minimum: 1
 *           default: 5
 *           description: Used only when type is rating; the scale is always 1 through ratingMax.
 *         ratingLowLabel:
 *           type: string
 *           maxLength: 255
 *           default: ''
 *         ratingHighLabel:
 *           type: string
 *           maxLength: 255
 *           default: ''
 *       additionalProperties: false
 *     BuilderNode:
 *       type: object
 *       required: [id, type, position, data]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         type:
 *           $ref: '#/components/schemas/QuestionType'
 *         position:
 *           $ref: '#/components/schemas/BuilderPosition'
 *         data:
 *           $ref: '#/components/schemas/BuilderNodeData'
 *       additionalProperties: false
 *     BuilderEdge:
 *       type: object
 *       required: [source, target]
 *       properties:
 *         source:
 *           type: string
 *           format: uuid
 *         target:
 *           type: string
 *           format: uuid
 *       additionalProperties: false
 *     Builder:
 *       type: object
 *       required: [nodes, edges, viewport]
 *       properties:
 *         nodes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BuilderNode'
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BuilderEdge'
 *         viewport:
 *           type: object
 *           additionalProperties: true
 *       additionalProperties: false
 *     CreateFormRequest:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 255
 *         description:
 *           type: string
 *           maxLength: 2000
 *     UpdateFormRequest:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 255
 *         description:
 *           type: string
 *           maxLength: 2000
 *         status:
 *           $ref: '#/components/schemas/FormStatus'
 *     FormDetailsResponse:
 *       type: object
 *       required: [form, questions]
 *       properties:
 *         form:
 *           $ref: '#/components/schemas/Form'
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *     PublicFormResponse:
 *       type: object
 *       required: [form, questions]
 *       properties:
 *         form:
 *           $ref: '#/components/schemas/PublicForm'
 *         questions:
 *           type: array
 *           description: Questions are already ordered for one-at-a-time rendering.
 *           items:
 *             $ref: '#/components/schemas/PublicQuestion'
 *     SubmitAnswerRequest:
 *       description: Provide optionIds for select/radio/checkbox answers or value for text/number/email answers, never both.
 *       type: object
 *       required: [questionId]
 *       properties:
 *         questionId:
 *           type: string
 *           format: uuid
 *         optionIds:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: string
 *             format: uuid
 *         value:
 *           type: string
 *           maxLength: 1000
 *       oneOf:
 *         - required: [optionIds]
 *         - required: [value]
 *       additionalProperties: false
 *     SubmitResponseRequest:
 *       type: object
 *       required: [answers]
 *       properties:
 *         answers:
 *           type: array
 *           maxItems: 200
 *           items:
 *             $ref: '#/components/schemas/SubmitAnswerRequest'
 *         completionMs:
 *           type: integer
 *           minimum: 0
 *           maximum: 86400000
 *       additionalProperties: false
 *     SubmittedResponse:
 *       type: object
 *       required: [id, formId, submittedAt]
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
 *     SubmitResponseResponse:
 *       type: object
 *       required: [response]
 *       properties:
 *         response:
 *           $ref: '#/components/schemas/SubmittedResponse'
 *   parameters:
 *     FormId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *     PublicId:
 *       in: path
 *       name: publicId
 *       required: true
 *       schema:
 *         type: string
 *   responses:
 *     InvalidRequest:
 *       description: Invalid request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Unauthorized:
 *       description: Authentication is required
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     FormNotFound:
 *       description: Form not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Readiness check
 *     responses:
 *       '200':
 *         description: API and database are available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       '503':
 *         description: API is running but the database is unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness check
 *     responses:
 *       '200':
 *         description: API process is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 * /public/forms/{publicId}:
 *   get:
 *     tags: [Public Forms]
 *     summary: Get a published form for a responder
 *     parameters:
 *       - $ref: '#/components/parameters/PublicId'
 *     responses:
 *       '200':
 *         description: Published form and its ordered questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicFormResponse'
 *       '400':
 *         $ref: '#/components/responses/InvalidRequest'
 *       '404':
 *         description: Published form not found
 * /public/forms/{publicId}/responses:
 *   post:
 *     tags: [Public Forms]
 *     summary: Submit a response to a published form
 *     parameters:
 *       - $ref: '#/components/parameters/PublicId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitResponseRequest'
 *     responses:
 *       '201':
 *         description: Response recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmitResponseResponse'
 *       '400':
 *         description: Invalid body or answers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Published form not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /forms:
 *   get:
 *     tags: [Forms]
 *     summary: List forms for the authenticated owner
 *     description: Requires a Better Auth session cookie.
 *     responses:
 *       '200':
 *         description: Forms list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [forms]
 *               properties:
 *                 forms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Form'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Forms]
 *     summary: Create a draft form
 *     description: Requires a Better Auth session cookie.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFormRequest'
 *     responses:
 *       '201':
 *         description: Form created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [form]
 *               properties:
 *                 form:
 *                   $ref: '#/components/schemas/Form'
 *       '400':
 *         $ref: '#/components/responses/InvalidRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 * /forms/{id}:
 *   get:
 *     tags: [Forms]
 *     summary: Get an owned form with ordered questions and options
 *     parameters:
 *       - $ref: '#/components/parameters/FormId'
 *     responses:
 *       '200':
 *         description: Form details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FormDetailsResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/FormNotFound'
 *   patch:
 *     tags: [Forms]
 *     summary: Update owned form metadata or status
 *     parameters:
 *       - $ref: '#/components/parameters/FormId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFormRequest'
 *     responses:
 *       '200':
 *         description: Updated form
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [form]
 *               properties:
 *                 form:
 *                   $ref: '#/components/schemas/Form'
 *       '400':
 *         $ref: '#/components/responses/InvalidRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/FormNotFound'
 *   delete:
 *     tags: [Forms]
 *     summary: Delete an owned form and its dependent data
 *     parameters:
 *       - $ref: '#/components/parameters/FormId'
 *     responses:
 *       '200':
 *         description: Form deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/FormNotFound'
 * /forms/{id}/duplicate:
 *   post:
 *     tags: [Forms]
 *     summary: Duplicate an owned form, questions, options, and graph
 *     parameters:
 *       - $ref: '#/components/parameters/FormId'
 *     responses:
 *       '201':
 *         description: Duplicated form
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [form]
 *               properties:
 *                 form:
 *                   $ref: '#/components/schemas/Form'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/FormNotFound'
 * /forms/{id}/builder:
 *   get:
 *     tags: [Builder]
 *     summary: Get an owned form's persisted builder graph
 *     parameters:
 *       - $ref: '#/components/parameters/FormId'
 *     responses:
 *       '200':
 *         description: Builder graph
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Builder'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/FormNotFound'
 *   put:
 *     tags: [Builder]
 *     summary: Transactionally save an owned form's complete builder graph
 *     parameters:
 *       - $ref: '#/components/parameters/FormId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Builder'
 *     responses:
 *       '200':
 *         description: Saved builder graph
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Builder'
 *       '400':
 *         description: Invalid payload or graph
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/FormNotFound'
 */
export const openApiDocs = true;
