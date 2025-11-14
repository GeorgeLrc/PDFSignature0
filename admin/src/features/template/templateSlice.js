import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    templates: []
}

const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        setTemplates(state, action) {
            state.templates = action.payload
        },
        createTemplate(state, action) {
            state.templates.push(action.payload)
        },
        deleteTemplate(state, action) {
            state.templates = state.templates.filter(template => template._id !== action.payload)
        },
        renameTemplate: {
            prepare: (id, title) => {
                return {
                    payload: { id, title }
                }
            },
            reducer: (state, action) => {
                const template = state.templates.find(template => template._id === action.payload.id)
                template.title = action.payload.title
            }
        }
    }
})

export const { setTemplates, createTemplate, deleteTemplate, renameTemplate } = templateSlice.actions

export default templateSlice.reducer

export const getTemplates = state => state.template.templates