export const previewImageInput = document.querySelector('#previewImageInput')
export const displaySingleImge = document.querySelector('#displaySingleImge')
export const displayMultipleImge = document.querySelector('#displayMultipleImge')
export const previewImagesInput = document.querySelector('#previewImagesInput')
export const apiInput = document.querySelector('#apiInput')
export const Form = document.querySelector('#SubmitForm') || document.querySelector('#updateForm')
export const submitFormBtn = document.querySelector('#submitFormBtn')
export const datatable = document.querySelector('#tabulator')
import Fetch from "./fetch.js"

const notyf = new Notyf({
    duration: 1000,
    position: { x: 'right', y: 'bottom' },
    types: [
        { type: 'warning', background: 'orange', duration: 2000 },
        { type: 'info', background: 'lightblue', duration: 2000 }
    ]
}) // Set Notifications For Server Response

export const displayPreviewImage = async (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = () => displaySingleImge.src = reader.result;
    reader.readAsDataURL(file)
}

// Function that display preview multiple images
export const displayPreviewImages = (e) => {
    const alert = document.querySelector('#imagesAlert')
    const files = e.target.files;
    const filesArray = Array.from(files)

    if (previewImg) previewImg.style.display = 'none';
    if (Formbtn.id === 'submitForm') previewMultipleImage.innerHTML = '';

    if (filesArray.length > 4) alert.style.display = 'block'
    else alert.style.display = 'none'

    filesArray.forEach(file => {
        const reader = new FileReader()
        const div = document.createElement('div')
        const ImgTag = document.createElement('img')
        const iTag = document.createElement('i')

        div.className = 'position-relative imgbox';
        iTag.className = 'bi bi-x-lg position-absolute z-2 top-50 start-50 translate-middle cross';

        div.appendChild(ImgTag)
        div.appendChild(iTag)

        reader.onload = () => {
            ImgTag.src = reader.result;
            iTag.dataset.image = file.name;
            ImgTag.classList.add('images')
        }
        reader.readAsDataURL(file)
        previewMultipleImage.appendChild(div)
    })
}

export const Notify = (data) => {
    if (data.success) notyf.success(data.success)
    if (data.warning) notyf.open({ type: 'warning', message: data.warning })
    if (data.info) notyf.open({ type: 'info', message: data.info })
    if (data.error) notyf.error(data.error)
    if (data.errors) data.errors.forEach(error => notyf.error(error))
    return;
}

export const openDangerModal = (api) => { // Handle Open Delete Modal
    modalconfirmdeleteBtn.onclick = () => handleDeleteRequest(api)
}

export const updatetableDataStatus = async (status, api) => {
    try {
        const res = await Fetch.patch(api, { status }, { 'Content-Type': 'application/json' })
        Notify(res)
    } catch (error) {
        console.error(error)
    }
}

const handleDeleteRequest = async (api) => {
    const res = await Fetch.delete(api)
    Notify(res)
    if (res.success) setTimeout(() => window.location.reload(), 1000)
}

export const setupSelect2 = (selector, url, placeholder) => {
    $(selector).select2({
        placeholder,
        ajax: {
            url,
            dataType: 'json',
            delay: 250,
            cache: true,
            data: params => ({ search: params.term }),
            processResults: data => ({
                results: data.map(item => ({
                    id: item._id,
                    text: item.name
                }))
            })
        }
    })
}

export const deleteCRUDFieldRow = (...selectors) => {
    selectors.forEach(selector => {
        const container = document.querySelector(selector)
        if (!container) return

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('deleteFieldRow')) {
                const row = e.target.closest('.field-group')
                row?.remove()
            }
        })
    })
}