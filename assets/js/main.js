import '../vendor/jquery/jquery.min.js'
import '../vendor/bootstrap/js/bootstrap.bundle.min.js'
import '../vendor/select2/js/select2.full.min.js'
import '../vendor/pace-progress/pace.min.js'
import '../vendor/summernote/summernote.min.js'
import '../vendor/adminlte/adminlte.min.js'
import '../vendor/iconpicker/fontawesome-iconpicker.min.js'
import Fetch from "./fetch.js"
import {
  datatable, displayPreviewImage, apiInput, updatetableDataStatus,
  Form, Notify, previewImageInput, openDangerModal, setupSelect2, deleteCRUDFieldRow,
  FieldCheckBox, setFieldDefaultValue, FieldRow
} from "./variable.js";

datatable && initializeTabulator()
$('.iconpicker').length && $('.iconpicker').iconpicker({
  fullClassFormatter: function (val) { return 'fa ' + val }
})
$('.summernote').length && $('.summernote').summernote({ height: 300 })
$('.select2').length && $('.select2').select2()
previewImageInput && (
  previewImageInput.onchange = (e) => displayPreviewImage(e) // display image preview
)

Form && (
  Form.onsubmit = async (e) => {
    try {
      e.preventDefault()
      let res;
      submitFormBtn.disabled = true;
      submitFormBtn.innerHTML = 'Submitting...';

      const formdata = new FormData(e.target)

      Form.id === 'SubmitForm' // Handle Data Submission To Server
        ? res = await Fetch.post(apiInput.value.trim(), formdata)
        : res = await Fetch.put(`${apiInput.value.trim()}/${e.target.dataset?.id}`, formdata)

      Notify(res) // Notify Server Message
      if (res.success && res.redirect) setTimeout(() => { window.location.href = res.redirect }, 800)
    } catch (error) {
      console.error(error)
    } finally {
      submitFormBtn.disabled = false;
      submitFormBtn.innerHTML = 'Submit';
    }
  }
)

datatable && (
  datatable.onclick = (e) => { // Handle Datatable Actions
    const endApi = `${apiInput.value.trim()}/${e.target.dataset.id}`;

    if (e.target.closest('.danger-modal')) openDangerModal(endApi)
    if (e.target.closest('.status')) updatetableDataStatus(e.target.checked, endApi)
    if (e.target.closest('.edit')) getTableRowData(endApi)
  }
)

// Handle Select2 functionality
document.querySelectorAll('select[id]').forEach((select) => {
  const id = select.id;
  const resource = id.includes('s') ? id.split('s')[0] : id;
  if (resource) {
    const selector = `#${id}`;
    const url = `/admin/resources/select/api/${resource}`;
    setupSelect2(selector, url, `Search ${id}`)
  }
})

let counter = parseInt(document.querySelector('#counter')?.value) || 0;
let collections = null;

const addFieldBtn = document.querySelector('#addFieldBtn');
const fieldsContainer = document.querySelector('#addField');

// Fetch collections asynchronously and store them
(async () => {
  collections = await Fetch.get('/admin/collections')
})();

// Delete field row logic (assumed to be defined elsewhere)
deleteCRUDFieldRow('#addField')

// Handle Add Field button click
addFieldBtn?.addEventListener('click', () => {
  const filters = ['search', 'boolean', 'groupValueFilter', 'date', 'minmax', 'number'];

  // Dynamic IDs based on counter
  const fieldId = `field_${counter}`;
  const typeId = `type_${counter}`;
  const formTypeId = `form_type_${counter}`;
  const collectionId = `relation_collection_${counter}`;
  const searchFilterId = `search_filter_${counter}`;

  // Template for new field block
  const fieldTemplate = `
    <div class="field-group">
      <h3>Field ${counter + 1}</h3>
      ${FieldRow(fieldId, formTypeId, typeId, counter)}

      <div id="imageSettings_${counter}" class="row mb-2 d-none"></div>

      <div class="row mb-2">
        <div class="col-md-3">${FieldCheckBox(counter)}</div>
        <div class="col-md-4">
          <label for="${searchFilterId}" class="form-label">Search Filter</label>
          <select name="field[${counter}][searchFilter]" class="select2 form-control" id="${searchFilterId}">
            <option disabled selected>Select Search Filter</option>
            ${filters.map(name => `<option value="${name}">${name}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-4">
          <label for="${collectionId}" class="form-label">Field Relation</label>
          <select name="field[${counter}][relation]" class="select2 form-control" id="${collectionId}">
            <option selected>No Relation</option>
            ${collections.map(name => `<option value="${name}">${name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div id="defaultValueRow_${counter}" class="row mb-2 d-none">
        <div class="col-md-3"></div>
      </div>

      <hr style="border-top:1px solid rgba(0,0,0,0.4);">
    </div>`;

  // Append to DOM
  fieldsContainer.insertAdjacentHTML('beforeend', fieldTemplate)

  // Reinitialize select2 for dynamic elements
  $('.select2').select2()
  counter++;
})

// Listen for select[type] changes dynamically
$(document).on('change', 'select[data-counter]', function (e) {
  const counter = $(this).data('counter')
  const selectedValue = $(this).val()
  const imageSettingsEl = document.querySelector(`#imageSettings_${counter}`)

  if (selectedValue === 'file') {
    imageSettingsEl.classList.remove('d-none')
    imageSettingsEl.innerHTML = `
      <div class="col-md-5 offset-md-6">
        <div class="d-flex gap-2 justify-content-center">
          <div class="form-floating mb-3">
            <input type="number" class="form-control" name="field[${counter}][file][length]" min="0" id="formId${counter}" />
            <label for="formId${counter}">Length</label>
          </div>
          <div class="form-floating mb-3">
            <input type="number" class="form-control" name="field[${counter}][file][size]" id="formId${counter}" min="0" />
            <label for="formId${counter}">Size (eg: 2 * 1024 = 2KB)</label>
          </div>
        </div>
      </div>`;
  } else {
    imageSettingsEl.classList.add('d-none')
  }
})

// Toggle default value row and attach onchange to type select
fieldsContainer && (
  fieldsContainer.onclick = (e) => {
    const counter = e.target.dataset.counter;
    if (!counter) return;

    const typeSelect = document.querySelector(`#type_${counter}`)
    const defaultRow = document.querySelector(`#defaultValueRow_${counter}`)

    if (defaultRow) {
      defaultRow.classList.toggle('d-none');
      setFieldDefaultValue(counter, defaultRow, typeSelect?.value)
    }

    // Attach onchange to type selector
    if (typeSelect) {
      typeSelect.onchange = (e) => {
        setFieldDefaultValue(counter, defaultRow, e.target.value)
      }
    }
  }
)

// Submenu checkbox toggle
const subMenuCheck = document.querySelector('#isSubMenu')
subMenuCheck?.addEventListener('change', () => {
  document.querySelector('#subMenusettings')?.classList.toggle('d-none')
  document.querySelector('#mainIcon')?.classList.toggle('d-none')
})