function setMessage(message, isError = false) {
  const box = document.getElementById('msg');
  if (!box) return;
  box.textContent = message || '';
  box.classList.toggle('error', isError);
  box.classList.toggle('success', !isError && Boolean(message));
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return { response, data };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  return { response, data };
}

function fillEmailInputs(email) {
  ['verifyEmail', 'resendVerifyEmail', 'resetEmail'].forEach(id => {
    const input = document.getElementById(id);
    if (input && email) input.value = email;
  });
}

const params = new URLSearchParams(location.search);
const emailFromQuery = params.get('email');
if (emailFromQuery) fillEmailInputs(emailFromQuery);

if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').onsubmit = async event => {
    event.preventDefault();
    const form = event.target;
    const { response, data } = await postJson('/auth/register', {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value
    });
    setMessage(data.message, !response.ok);
    if (response.ok) {
      setTimeout(() => {
        location.href = `/verify.html?email=${encodeURIComponent(data.email)}`;
      }, 1200);
    }
  };
}

if (document.getElementById('verifyForm')) {
  document.getElementById('verifyForm').onsubmit = async event => {
    event.preventDefault();
    const form = event.target;
    const { response, data } = await postJson('/auth/verify-register-otp', {
      email: form.email.value.trim(),
      otp: form.otp.value.trim()
    });
    setMessage(data.message, !response.ok);
    if (response.ok) {
      setTimeout(() => {
        location.href = '/login.html';
      }, 1200);
    }
  };
}

if (document.getElementById('resendVerifyForm')) {
  document.getElementById('resendVerifyForm').onsubmit = async event => {
    event.preventDefault();
    const form = event.target;
    const { response, data } = await postJson('/auth/resend-verification-otp', {
      email: form.email.value.trim()
    });
    setMessage(data.message, !response.ok);
    if (response.ok) fillEmailInputs(form.email.value.trim());
  };
}

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').onsubmit = async event => {
    event.preventDefault();
    const form = event.target;
    const { response, data } = await postJson('/auth/login', {
      identifier: form.identifier.value.trim(),
      password: form.password.value
    });
    setMessage(data.message, !response.ok);
    if (response.ok) {
      setTimeout(() => {
        location.href = '/dashboard.html';
      }, 1000);
      return;
    }
    if (data.needsVerification && data.email) {
      setTimeout(() => {
        location.href = `/verify.html?email=${encodeURIComponent(data.email)}`;
      }, 1400);
    }
  };
}

if (document.getElementById('forgotForm')) {
  document.getElementById('forgotForm').onsubmit = async event => {
    event.preventDefault();
    const email = event.target.email.value.trim();
    const { response, data } = await postJson('/auth/forgot-password', { email });
    setMessage(data.message, !response.ok);
    if (response.ok) {
      setTimeout(() => {
        location.href = `/reset.html?email=${encodeURIComponent(email)}`;
      }, 1200);
    }
  };
}

if (document.getElementById('resetForm')) {
  document.getElementById('resetForm').onsubmit = async event => {
    event.preventDefault();
    const form = event.target;
    const { response, data } = await postJson('/auth/reset-password', {
      email: form.email.value.trim(),
      otp: form.otp.value.trim(),
      newPassword: form.newPassword.value
    });
    setMessage(data.message, !response.ok);
    if (response.ok) {
      setTimeout(() => {
        location.href = '/login.html';
      }, 1200);
    }
  };
}

function logout() {
  fetch('/auth/logout', { method: 'POST' }).then(() => location.href = '/login.html');
}

if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').onclick = logout;
}

if (document.body.classList.contains('dashboard-page')) {
  const state = {
    mode: 'notes',
    selectedNoteId: null,
    sidebarNotes: [],
    gridNotes: []
  };

  const usernameEl = document.getElementById('currentUsername');
  const notesGrid = document.getElementById('notesGrid');
  const sidebarNotesList = document.getElementById('sidebarNotesList');
  const mainSectionTitle = document.getElementById('mainSectionTitle');
  const dashboardHint = document.getElementById('dashboardHint');
  const noteViewer = document.getElementById('noteViewer');
  const noteSearchInput = document.getElementById('noteSearchInput');
  const noteModal = document.getElementById('noteModal');
  const noteModalTitle = document.getElementById('noteModalTitle');
  const editingNoteId = document.getElementById('editingNoteId');
  const noteTitleInput = document.getElementById('noteTitleInput');
  const noteContentInput = document.getElementById('noteContentInput');
  const showMyNotesBtn = document.getElementById('showMyNotesBtn');
  const showTrashBtn = document.getElementById('showTrashBtn');

  function setActiveMode(mode) {
    const isTrash = mode === 'trash';
    showMyNotesBtn.classList.toggle('active', !isTrash);
    showTrashBtn.classList.toggle('active', isTrash);
  }

  function formatDate(value) {
    return new Date(value).toLocaleString('vi-VN');
  }

  function resetViewer(title, text) {
    noteViewer.className = 'note-viewer empty';
    noteViewer.innerHTML = `
      <div class="note-viewer-placeholder">
        <h2>${title}</h2>
        <p>${text}</p>
      </div>
    `;
  }

  function openNoteModal(note = null) {
    noteModal.classList.remove('hidden');
    if (note) {
      noteModalTitle.textContent = 'Chỉnh sửa ghi chú';
      editingNoteId.value = note.id;
      noteTitleInput.value = note.title;
      noteContentInput.value = note.content;
    } else {
      noteModalTitle.textContent = 'Tạo ghi chú';
      editingNoteId.value = '';
      noteTitleInput.value = '';
      noteContentInput.value = '';
    }
  }

  function closeNoteModal() {
    noteModal.classList.add('hidden');
    editingNoteId.value = '';
    noteTitleInput.value = '';
    noteContentInput.value = '';
    setMessage('');
  }

  function renderSidebarNotes() {
    sidebarNotesList.innerHTML = '';
    if (!state.sidebarNotes.length) {
      const message = state.mode === 'trash' ? 'Chưa có' : state.mode === 'search' ? 'Không tìm thấy kết quả phù hợp nào.' : 'Chưa có';
      sidebarNotesList.innerHTML = `<li class="sidebar-empty">${message}</li>`;
      return;
    }

    state.sidebarNotes.forEach(note => {
      const item = document.createElement('li');
      item.className = `sidebar-note-item${note.id === state.selectedNoteId ? ' selected' : ''}`;
      item.innerHTML = `
        <button type="button">
          <strong>${note.title}</strong>
          <span>${state.mode === 'trash' ? 'Đã xóa: ' : 'Tạo lúc: '}${formatDate(note.deleted_at || note.created_at)}</span>
        </button>
      `;
      item.querySelector('button').onclick = () => {
        if (state.mode === 'trash') {
          state.selectedNoteId = note.id;
          renderSidebarNotes();
          renderTrashPreview(note);
        } else {
          loadNoteDetail(note.id);
        }
      };
      sidebarNotesList.appendChild(item);
    });
  }

  function renderNotesGrid() {
    notesGrid.innerHTML = '';
    if (!state.gridNotes.length) {
      const message = state.mode === 'trash' ? 'Chưa có' : state.mode === 'search' ? 'Không tìm thấy kết quả phù hợp nào.' : 'Chưa có';
      notesGrid.innerHTML = `<article class="note-card empty-card"><p>${message}</p></article>`;
      return;
    }

    state.gridNotes.forEach(note => {
      const card = document.createElement('article');
      card.className = 'note-card';
      card.innerHTML = `
        <div class="note-card-icon"></div>
        <h3>${note.title}</h3>
        <p>${state.mode === 'trash' ? 'Đã xóa lúc ' : 'Cập nhật lúc '}${formatDate(note.deleted_at || note.updated_at || note.created_at)}</p>
      `;
      card.onclick = () => {
        if (state.mode === 'trash') {
          state.selectedNoteId = note.id;
          renderSidebarNotes();
          renderTrashPreview(note);
        } else {
          loadNoteDetail(note.id);
        }
      };
      notesGrid.appendChild(card);
    });
  }

  function renderTrashPreview(note) {
    noteViewer.className = 'note-viewer';
    noteViewer.innerHTML = `
      <div class="note-viewer-head">
        <div>
          <p class="section-tag">Thùng rác</p>
          <h2>${note.title}</h2>
          <p class="note-meta">Đã xóa lúc ${formatDate(note.deleted_at)}</p>
        </div>
      </div>
      <div class="note-viewer-body">
        <p>Ghi chú này đang nằm trong thùng rác và sẽ bị xóa tự động sau 30 ngày nếu bạn không khôi phục.</p>
      </div>
      <div class="note-viewer-actions">
        <button type="button" id="restoreNoteBtn">Khôi phục</button>
        <button type="button" class="danger-btn" id="deleteForeverBtn">Xóa vĩnh viễn</button>
      </div>
    `;

    document.getElementById('restoreNoteBtn').onclick = async () => {
      const { response, data } = await postJson(`/notes/${note.id}/restore`, {});
      setMessage(data.message, !response.ok);
      if (response.ok) loadMyNotes();
    };

    document.getElementById('deleteForeverBtn').onclick = async () => {
      const { response, data } = await fetchJson(`/notes/${note.id}/permanent`, { method: 'DELETE' });
      setMessage(data.message, !response.ok);
      if (response.ok) loadTrashNotes();
    };
  }

  async function loadNoteDetail(noteId) {
    const { response, data } = await fetchJson(`/notes/${noteId}`);
    if (!response.ok) {
      setMessage(data.message, true);
      return;
    }

    state.selectedNoteId = noteId;
    renderSidebarNotes();
    noteViewer.className = 'note-viewer';
    noteViewer.innerHTML = `
      <div class="note-viewer-head">
        <div>
          <p class="section-tag">Chi tiết ghi chú</p>
          <h2>${data.title}</h2>
          <p class="note-meta">Tạo lúc ${formatDate(data.created_at)} • Cập nhật ${formatDate(data.updated_at)}</p>
        </div>
      </div>
      <div class="note-viewer-body">
        <p>${data.content.replace(/\n/g, '<br>')}</p>
      </div>
      <div class="note-viewer-actions">
        <button type="button" id="editNoteBtn">Chỉnh sửa</button>
        <button type="button" class="danger-btn" id="trashNoteBtn">Chuyển vào thùng rác</button>
      </div>
    `;

    document.getElementById('editNoteBtn').onclick = () => openNoteModal(data);
    document.getElementById('trashNoteBtn').onclick = async () => {
      const { response: deleteResponse, data: deleteData } = await fetchJson(`/notes/${noteId}`, { method: 'DELETE' });
      setMessage(deleteData.message, !deleteResponse.ok);
      if (deleteResponse.ok) loadMyNotes();
    };
  }

  async function loadCurrentUser() {
    const { response, data } = await fetchJson('/auth/me');
    if (response.ok) usernameEl.textContent = data.user.username;
  }

  async function loadMyNotes() {
    state.mode = 'notes';
    state.selectedNoteId = null;
    noteSearchInput.value = '';
    setActiveMode('notes');
    mainSectionTitle.textContent = 'Ghi chú của tôi';
    dashboardHint.textContent = 'Chọn một ghi chú ở menu bên trái để xem nội dung, hoặc nhấn dấu cộng để tạo ghi chú mới.';
    const { data } = await fetchJson('/notes');
    state.sidebarNotes = data;
    state.gridNotes = data;
    renderSidebarNotes();
    renderNotesGrid();
    resetViewer('Chưa chọn ghi chú nào', 'Nội dung chi tiết sẽ xuất hiện ở đây khi bạn nhấp vào một ghi chú.');
  }

  async function loadTrashNotes() {
    state.mode = 'trash';
    state.selectedNoteId = null;
    noteSearchInput.value = '';
    setActiveMode('trash');
    mainSectionTitle.textContent = 'Thùng rác';
    dashboardHint.textContent = 'Các ghi chú bị xóa sẽ được lưu trong thùng rác tối đa 30 ngày.';
    const { data } = await fetchJson('/notes/trash/list');
    state.sidebarNotes = data;
    state.gridNotes = data;
    renderSidebarNotes();
    renderNotesGrid();
    if (!data.length) {
      resetViewer('Thùng rác', 'Chưa có');
    } else {
      resetViewer('Thùng rác', 'Chọn một ghi chú đã xóa để khôi phục hoặc xóa vĩnh viễn.');
    }
  }

  async function runSearch() {
    const query = noteSearchInput.value.trim();
    if (!query) {
      loadMyNotes();
      return;
    }

    state.mode = 'search';
    state.selectedNoteId = null;
    setActiveMode('notes');
    mainSectionTitle.textContent = 'Ghi chú của tôi';
    dashboardHint.textContent = `Đang tìm theo tiêu đề: "${query}"`;
    const { data } = await fetchJson(`/notes?q=${encodeURIComponent(query)}`);
    state.sidebarNotes = data;
    state.gridNotes = data;
    renderSidebarNotes();
    renderNotesGrid();
    if (!data.length) {
      resetViewer('Ghi chú của tôi', 'Không tìm thấy kết quả phù hợp nào.');
    } else {
      resetViewer('Ghi chú của tôi', 'Nhấp vào một ghi chú ở bên trái hoặc trong lưới để xem chi tiết.');
    }
  }

  document.getElementById('openCreateNoteBtn').onclick = () => openNoteModal();
  document.getElementById('closeNoteModalBtn').onclick = closeNoteModal;
  showMyNotesBtn.onclick = () => loadMyNotes();
  showTrashBtn.onclick = () => loadTrashNotes();
  document.getElementById('noteSearchBtn').onclick = runSearch;
  noteSearchInput.onkeydown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runSearch();
    }
  };

  document.getElementById('noteEditorForm').onsubmit = async event => {
    event.preventDefault();
    const noteId = editingNoteId.value;
    const payload = {
      title: noteTitleInput.value.trim(),
      content: noteContentInput.value
    };
    const url = noteId ? `/notes/${noteId}` : '/notes';
    const method = noteId ? 'PUT' : 'POST';
    const { response, data } = await fetchJson(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setMessage(data.message, !response.ok);
    if (response.ok) {
      closeNoteModal();
      loadMyNotes();
    }
  };

  noteModal.onclick = event => {
    if (event.target === noteModal) closeNoteModal();
  };

  loadCurrentUser();
  loadMyNotes();
}
