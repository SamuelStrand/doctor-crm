import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  ru: {
    translation: {
      common: {
        save: "Сохранить",
        saving: "Сохраняем…",
        cancel: "Отмена",
        back: "Назад",
        loading: "Загрузка…",
        search: "Поиск",
        logout: "Выйти",
        language: "Язык",
      },

      nav: {
        home: "Главная",
        doctor: "Доктор",
        admin: "Админ",
        appointments: "Записи",
        calendar: "Календарь",
        schedule: "Расписание",
        visitNotes: "Заметки",
        patients: "Пациенты",
        timeOff: "Отгулы",
        doctors: "Доктора",
        services: "Услуги",
        rooms: "Кабинеты",
      },

      auth: {
        login: "Вход",
        email: "Почта",
        password: "Пароль",
        signIn: "Войти",
        signingIn: "Входим...",
      },

      admin: {
        dashboard: {
          title: "Админ • Панель",
          subtitle:
            "Управление данными клиники: записи, пациенты, врачи, услуги и кабинеты.",
          badges: {
            crud: "CRUD",
            search: "Поиск и фильтры",
            roleAccess: "Доступ по ролям",
          },
          cards: {
            appointments: {
              title: "Записи",
              desc: "Управление всеми записями: поиск, фильтры, редактирование и удаление",
            },
            patients: {
              title: "Пациенты",
              desc: "Список пациентов: CRUD + поиск",
            },
            doctors: {
              title: "Врачи",
              desc: "Список врачей: CRUD + поиск",
            },
            services: {
              title: "Услуги",
              desc: "Список услуг клиники и управление ими",
            },
            rooms: {
              title: "Кабинеты",
              desc: "Управление кабинетами и настройка",
            },
            schedule: {
              title: "Расписание",
              desc: "Просмотр общего расписания врачей (режим администратора)",
            },
          },
          footerTip:
            "Совет: используйте поиск внутри каждого раздела (Пациенты / Врачи / Записи), чтобы быстро находить записи.",
        },

        // ✅ AdminSchedulePage
        schedule: {
          breadcrumb: "Расписание",
          title: "Общее расписание",
          sub: "Формируется на основе записей (Appointments).",
          loadingDoctors: "Список врачей загружается…",
          from: "С",
          to: "По",
          show: "Показать",
          loading: "Загрузка…",
          reset: "Сбросить",
          total: "Всего",
          empty: "Нет записей в выбранном диапазоне.",
          apptShort: "зап.",
          doctor: {
            label: "Врач",
            all: "Все",
            fallback: "Врач",
            unknown: "Врач —",
          },
          status: {
            scheduled: "Запланировано",
            confirmed: "Подтверждено",
            completed: "Завершено",
            cancelled: "Отменено",
            noShow: "Не пришёл",
          },
          table: {
            id: "ID",
            start: "Начало",
            end: "Конец",
            status: "Статус",
            patient: "Пациент",
            service: "Услуга",
            room: "Кабинет",
          },
        },

        // ✅ AdminAppointmentsPage
        appointments: {
          breadcrumb: "Записи",
          title: "Записи",
          new: "Новая запись",
          searchPlaceholder: "Поиск (id, reason, comment...)",
          loading: "Загрузка…",
          total: "Всего",
          reset: "Сбросить",
          empty: "Записей нет",
          confirmDelete: "Удалить запись?",

          filters: {
            status: "Статус",
            all: "Все",
            from: "С",
            to: "По",
          },

          status: {
            scheduled: "Запланировано",
            confirmed: "Подтверждено",
            completed: "Завершено",
            cancelled: "Отменено",
            noShow: "Не пришёл",
          },

          table: {
            id: "ID",
            start: "Начало",
            end: "Конец",
            status: "Статус",
            patient: "Пациент",
            doctor: "Врач",
            service: "Услуга",
            room: "Кабинет",
            reason: "Причина",
            actions: "Действия",
          },

          actions: {
            open: "Открыть",
            edit: "Редакт.",
            delete: "Удалить",
          },

          pager: {
            prev: "‹ Назад",
            next: "Вперёд ›",
          },
        },

        // ✅ AdminDoctorsPage
        doctors: {
          breadcrumb: "Специалисты",
          title: "Специалисты",
          add: "Добавить специалиста",
          total: "Всего",
          searchPlaceholder: "Поиск специалиста",
          confirmDelete: "Удалить специалиста?",
          menu: "Меню",

          filters: {
            professionAll: "Все профессии",
            statusAll: "Все",
            statusOnline: "Онлайн",
            statusOffline: "Недоступен",
          },

          sort: {
            none: "Без сортировки",
            name: "По имени",
            new: "Сначала новые",
          },

          status: {
            online: "Онлайн",
            offline: "Недоступен",
          },

          workSchedule: "График работы",

          actions: {
            edit: "Редактировать",
            delete: "Удалить",
          },

          empty: "Специалистов нет",

          pager: {
            prev: "‹ Назад",
            next: "Вперёд ›",
          },

          modal: {
            createTitle: "Добавить специалиста",
            editTitle: "Редактировать специалиста #{{id}}",
            close: "Закрыть",
            createBtn: "Создать",
          },

          form: {
            email: "Email",
            passwordRequired: "Пароль *",
            passwordOptional: "Новый пароль (опц.)",
            passwordKeepEmpty: "Оставь пустым, чтобы не менять",
            passwordPlaceholder: "Введите пароль",

            firstName: "Имя",
            lastName: "Фамилия",
            status: "Статус",
            active: "Активен (Онлайн)",

            fullNameRequired: "ФИО (обязательное на бэке)",
            fullNamePlaceholder: " ",

            room: "Комната",
            roomNotSelected: "— не выбрано —",

            specialization: "Профессия / специализация",
            phone: "Телефон",
          },
        },

        // ✅ AdminAppointmentFormPage (create/edit)
        apptForm: {
          titleNew: "Новая запись",
          titleEdit: "Редактировать запись #{{id}}",
          formTitle: "Форма записи",
          sub: "Заполни данные записи: пациент, врач, услуга, кабинет и время.",
          refsLoading: "списки загружаются…",

          select: "— выбрать —",

          fields: {
            patient: "Пациент",
            doctor: "Врач",
            service: "Услуга",
            room: "Кабинет",
            start: "Начало",
            end: "Конец",
            reason: "Причина",
            comment: "Комментарий",
          },

          placeholders: {
            patientId: "ID пациента",
            doctorId: "ID врача",
            serviceId: "ID услуги",
            roomId: "ID кабинета",
            reason: "Причина",
            comment: "Комментарий",
          },

          hints: {
            patientsNotLoaded:
              "Список пациентов не загрузился — введи ID вручную.",
            doctorsNotLoaded: "Список врачей не загрузился — введи ID вручную.",
            servicesNotLoaded: "Список услуг не загрузился — введи ID вручную.",
            roomsNotLoaded:
              "Список кабинетов не загрузился — введи ID вручную.",
            localTime: "Локальное время компьютера.",
            endAfterStart: "End должен быть позже Start.",
          },

          validation: {
            patientRequired: "patient is required",
            doctorRequired: "doctor is required",
            serviceRequired: "service is required",
            roomRequired: "room is required",
            startRequired: "start_at is required",
            endRequired: "end_at is required",
            endAfterStart: "end_at must be after start_at",
          },
        },

        // ✅ AdminAppointmentDetailPage
        apptDetail: {
          backToList: "Назад к списку",
          title: "Запись #{{id}}",
          summaryTitle: "Сводка",

          confirmDelete: "Удалить эту запись?",

          actions: {
            edit: "Редактировать",
            delete: "Удалить",
            deleting: "Удаляем...",
          },

          labels: {
            status: "Статус",
            start: "Начало",
            end: "Конец",
            patient: "Пациент",
            doctor: "Врач",
            service: "Услуга",
            room: "Кабинет",
            reason: "Причина",
            comment: "Комментарий",
          },
        },

        // ✅ AdminServicesPage
        services: {
          breadcrumb: "Услуги",
          title: "Услуги",
          add: "Добавить услугу",
          total: "Всего",
          searchPlaceholder: "Поиск услуги",
          confirmDelete: "Удалить услугу?",
          menu: "Меню",

          minutesShort: "мин",

          status: {
            active: "Активна",
            inactive: "Неактивна",
          },

          actions: {
            edit: "Редактировать",
            delete: "Удалить",
          },

          kv: {
            code: "Код",
            duration: "Длительность",
            price: "Стоимость",
          },

          empty: "Услуг нет",

          pager: {
            prev: "‹ Назад",
            next: "Вперёд ›",
          },

          modal: {
            createTitle: "Добавить услугу",
            editTitle: "Редактировать услугу #{{id}}",
            close: "Закрыть",
            createBtn: "Создать",
          },

          form: {
            code: "Код",
            status: "Статус",
            active: "Активна",

            nameEn: "Название EN",
            nameRu: "Название RU",
            nameKk: "Название KK",

            duration: "Длительность (мин)",
            price: "Стоимость",
            pricePlaceholder: "10000 или 10000.00",

            descEn: "Описание EN",
            descRu: "Описание RU",
            descKk: "Описание KK",
          },

          validation: {
            codeNameRequired: "code and name_en are required",
          },
        },

        // ✅ AdminRoomsPage (NEW)
        rooms: {
          breadcrumb: "Кабинеты",
          title: "Кабинеты",
          searchPlaceholder: "Поиск кабинета",
          add: "Добавить кабинет",
          total: "Всего",
          confirmDelete: "Удалить кабинет?",

          none: "—",
          floorLabel: "Этаж {{floor}}",

          appointment: "Запись",

          legend: {
            busy: "Занято",
            free: "Свободно",
          },

          controls: {
            date: "Дата",
            from: "С",
            to: "До",
            step: "Шаг",
          },

          stepOptions: {
            min15: "15 мин",
            min30: "30 мин",
            min60: "60 мин",
          },

          table: {
            room: "Кабинет",
          },

          actions: {
            edit: "Редактировать",
            delete: "Удалить",
          },

          empty: "Кабинетов нет",

          pager: {
            prev: "‹ Назад",
            next: "Вперёд ›",
          },

          modal: {
            createTitle: "Добавить кабинет",
            editTitle: "Редактировать кабинет #{{id}}",
            close: "Закрыть",
            createBtn: "Создать",
          },

          form: {
            name: "Название",
            floor: "Этаж",
            comment: "Комментарий",
          },

          validation: {
            nameRequired: "name is required",
          },
        },

        // ✅ AdminPatientsPage (NEW)
        patients: {
          breadcrumb: "Клиенты",
          title: "Клиенты",
          add: "Добавить клиента",
          total: "Всего",
          searchPlaceholder: "Поиск клиента",
          confirmDelete: "Удалить клиента?",
          badgeNew: "Новый",
          menu: "Меню",
          lastAppointments: "Последние записи",
          noAppointments: "Записей нет",
          empty: "Клиентов нет",

          sort: {
            none: "Без сортировки",
            name: "По имени",
            created: "Сначала новые",
          },

          actions: {
            edit: "Редактировать",
            delete: "Удалить",
          },

          modal: {
            createTitle: "Добавить клиента",
            editTitle: "Редактировать клиента #{{id}}",
            close: "Закрыть",
            createBtn: "Создать",
          },

          form: {
            firstName: "Имя",
            lastName: "Фамилия",
            middleName: "Отчество",
            birthDate: "Дата рождения",
            gender: "Пол",
            phone: "Телефон",
            phonePlaceholder: "+7 ...",
            email: "Email",
            address: "Адрес",
            comment: "Комментарий",
          },

          gender: {
            u: "U (Неизвестно)",
            m: "M (Мужской)",
            f: "F (Женский)",
            o: "O (Другое)",
          },

          errors: {
            firstLastRequired: "first_name and last_name are required",
          },

          pager: {
            prev: "‹ Назад",
            next: "Вперёд ›",
          },
        },
      },

      home: {
        title: "Doctor CRM",
        subtitle:
          "Внутренняя система для клиник: управление записями, врачами, пациентами, услугами и кабинетами в одном месте.",
        badges: {
          roleAccess: "Доступ по ролям",
          calendar: "Записи и календарь",
          adminCrud: "Админ-панель CRUD",
        },
        sections: {
          who: {
            title: "Кто может войти",
            text: "Только администраторы и врачи могут пользоваться системой. Пациенты сюда не входят.",
          },
          admin: {
            title: "Админ",
            text: "Управляет врачами, пациентами, записями, услугами и кабинетами. Просматривает расписания и журнал действий.",
          },
          doctor: {
            title: "Врач",
            text: "Смотрит недельный календарь и записи, меняет статусы, работает со списком пациентов и заметками визита.",
          },
        },
      },
    },
  },

  en: {
    translation: {
      common: {
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        back: "Back",
        loading: "Loading…",
        search: "Search",
        logout: "Logout",
        language: "Language",
      },

      admin: {
        dashboard: {
          title: "Admin • Dashboard",
          subtitle:
            "Manage clinic data: appointments, patients, doctors, services and rooms.",
          badges: {
            crud: "CRUD",
            search: "Search & filters",
            roleAccess: "Role-based access",
          },
          cards: {
            appointments: {
              title: "Appointments",
              desc: "Manage all appointments: search, filters, edit & delete",
            },
            patients: {
              title: "Patients",
              desc: "Patients list with CRUD + search",
            },
            doctors: {
              title: "Doctors",
              desc: "Doctors list with CRUD + search",
            },
            services: {
              title: "Services",
              desc: "Clinic services list and management",
            },
            rooms: {
              title: "Rooms",
              desc: "Rooms management and configuration",
            },
            schedule: {
              title: "Schedule",
              desc: "View overall doctor schedules (admin view)",
            },
          },
          footerTip:
            "Tip: use the search input inside each section (Patients / Doctors / Appointments) to quickly find records.",
        },

        // ✅ AdminDoctorsPage
        doctors: {
          breadcrumb: "Doctors",
          title: "Doctors",
          add: "Add doctor",
          total: "Total",
          searchPlaceholder: "Search doctor",
          confirmDelete: "Delete doctor?",
          menu: "Menu",

          filters: {
            professionAll: "All professions",
            statusAll: "All",
            statusOnline: "Online",
            statusOffline: "Offline",
          },

          sort: {
            none: "No sorting",
            name: "By name",
            new: "Newest first",
          },

          status: {
            online: "Online",
            offline: "Offline",
          },

          workSchedule: "Working hours",

          actions: {
            edit: "Edit",
            delete: "Delete",
          },

          empty: "No doctors",

          pager: {
            prev: "‹ Previous",
            next: "Next ›",
          },

          modal: {
            createTitle: "Add doctor",
            editTitle: "Edit doctor #{{id}}",
            close: "Close",
            createBtn: "Create",
          },

          form: {
            email: "Email",
            passwordRequired: "Password *",
            passwordOptional: "New password (optional)",
            passwordKeepEmpty: "Leave empty to keep unchanged",
            passwordPlaceholder: "Enter password",

            firstName: "First name",
            lastName: "Last name",
            status: "Status",
            active: "Active (Online)",

            fullNameRequired: "Full name (required on backend)",
            fullNamePlaceholder: " ",

            room: "Room",
            roomNotSelected: "— not selected —",

            specialization: "Profession / specialization",
            phone: "Phone",
          },
        },

        // ✅ AdminServicesPage
        services: {
          breadcrumb: "Services",
          title: "Services",
          add: "Add service",
          total: "Total",
          searchPlaceholder: "Search service",
          confirmDelete: "Delete service?",
          menu: "Menu",

          minutesShort: "min",

          status: {
            active: "Active",
            inactive: "Inactive",
          },

          actions: {
            edit: "Edit",
            delete: "Delete",
          },

          kv: {
            code: "Code",
            duration: "Duration",
            price: "Price",
          },

          empty: "No services",

          pager: {
            prev: "‹ Previous",
            next: "Next ›",
          },

          modal: {
            createTitle: "Add service",
            editTitle: "Edit service #{{id}}",
            close: "Close",
            createBtn: "Create",
          },

          form: {
            code: "Code",
            status: "Status",
            active: "Active",

            nameEn: "Name EN",
            nameRu: "Name RU",
            nameKk: "Name KK",

            duration: "Duration (min)",
            price: "Price",
            pricePlaceholder: "10000 or 10000.00",

            descEn: "Description EN",
            descRu: "Description RU",
            descKk: "Description KK",
          },

          validation: {
            codeNameRequired: "code and name_en are required",
          },
        },

        // ✅ AdminRoomsPage (NEW)
        rooms: {
          breadcrumb: "Rooms",
          title: "Rooms",
          searchPlaceholder: "Search room",
          add: "Add room",
          total: "Total",
          confirmDelete: "Delete room?",

          none: "—",
          floorLabel: "Floor {{floor}}",

          appointment: "Appointment",

          legend: {
            busy: "Busy",
            free: "Free",
          },

          controls: {
            date: "Date",
            from: "From",
            to: "To",
            step: "Step",
          },

          stepOptions: {
            min15: "15 min",
            min30: "30 min",
            min60: "60 min",
          },

          table: {
            room: "Room",
          },

          actions: {
            edit: "Edit",
            delete: "Delete",
          },

          empty: "No rooms",

          pager: {
            prev: "‹ Previous",
            next: "Next ›",
          },

          modal: {
            createTitle: "Add room",
            editTitle: "Edit room #{{id}}",
            close: "Close",
            createBtn: "Create",
          },

          form: {
            name: "Name",
            floor: "Floor",
            comment: "Comment",
          },

          validation: {
            nameRequired: "name is required",
          },
        },

        // ✅ AdminSchedulePage
        schedule: {
          breadcrumb: "Schedule",
          title: "Overall schedule",
          sub: "Built from appointments.",
          loadingDoctors: "Loading doctors list…",
          from: "From",
          to: "To",
          show: "Show",
          loading: "Loading…",
          reset: "Reset",
          total: "Total",
          empty: "No appointments in the selected range.",
          apptShort: "appt",
          doctor: {
            label: "Doctor",
            all: "All",
            fallback: "Doctor",
            unknown: "Doctor —",
          },
          status: {
            scheduled: "Scheduled",
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
            noShow: "No show",
          },
          table: {
            id: "ID",
            start: "Start",
            end: "End",
            status: "Status",
            patient: "Patient",
            service: "Service",
            room: "Room",
          },
        },

        // ✅ AdminAppointmentsPage
        appointments: {
          breadcrumb: "Appointments",
          title: "Appointments",
          new: "New appointment",
          searchPlaceholder: "Search (id, reason, comment...)",
          loading: "Loading…",
          total: "Total",
          reset: "Reset",
          empty: "No appointments",
          confirmDelete: "Delete appointment?",

          filters: {
            status: "Status",
            all: "All",
            from: "From",
            to: "To",
          },

          status: {
            scheduled: "Scheduled",
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
            noShow: "No show",
          },

          table: {
            id: "ID",
            start: "Start",
            end: "End",
            status: "Status",
            patient: "Patient",
            doctor: "Doctor",
            service: "Service",
            room: "Room",
            reason: "Reason",
            actions: "Actions",
          },

          actions: {
            open: "Open",
            edit: "Edit",
            delete: "Delete",
          },

          pager: {
            prev: "‹ Previous",
            next: "Next ›",
          },
        },

        // ✅ AdminAppointmentFormPage (create/edit)
        apptForm: {
          titleNew: "New appointment",
          titleEdit: "Edit appointment #{{id}}",
          formTitle: "Appointment form",
          sub: "Fill appointment details: patient, doctor, service, room and time.",
          refsLoading: "lists are loading…",

          select: "— select —",

          fields: {
            patient: "Patient",
            doctor: "Doctor",
            service: "Service",
            room: "Room",
            start: "Start",
            end: "End",
            reason: "Reason",
            comment: "Comment",
          },

          placeholders: {
            patientId: "Patient ID",
            doctorId: "Doctor ID",
            serviceId: "Service ID",
            roomId: "Room ID",
            reason: "Reason",
            comment: "Comment",
          },

          hints: {
            patientsNotLoaded: "Patients list is not loaded — enter ID manually.",
            doctorsNotLoaded: "Doctors list is not loaded — enter ID manually.",
            servicesNotLoaded: "Services list is not loaded — enter ID manually.",
            roomsNotLoaded: "Rooms list is not loaded — enter ID manually.",
            localTime: "Local computer time.",
            endAfterStart: "End must be after Start.",
          },

          validation: {
            patientRequired: "patient is required",
            doctorRequired: "doctor is required",
            serviceRequired: "service is required",
            roomRequired: "room is required",
            startRequired: "start_at is required",
            endRequired: "end_at is required",
            endAfterStart: "end_at must be after start_at",
          },
        },

        // ✅ AdminAppointmentDetailPage
        apptDetail: {
          backToList: "Back to list",
          title: "Appointment #{{id}}",
          summaryTitle: "Summary",

          confirmDelete: "Delete this appointment?",

          actions: {
            edit: "Edit",
            delete: "Delete",
            deleting: "Deleting...",
          },

          labels: {
            status: "Status",
            start: "Start",
            end: "End",
            patient: "Patient",
            doctor: "Doctor",
            service: "Service",
            room: "Room",
            reason: "Reason",
            comment: "Comment",
          },
        },

        // ✅ AdminPatientsPage (NEW)
        patients: {
          breadcrumb: "Clients",
          title: "Clients",
          add: "Add client",
          total: "Total",
          searchPlaceholder: "Search client",
          confirmDelete: "Delete patient?",
          badgeNew: "New",
          menu: "Menu",
          lastAppointments: "Last appointments",
          noAppointments: "No appointments",
          empty: "No clients",

          sort: {
            none: "No sorting",
            name: "By name",
            created: "Newest first",
          },

          actions: {
            edit: "Edit",
            delete: "Delete",
          },

          modal: {
            createTitle: "Add client",
            editTitle: "Edit client #{{id}}",
            close: "Close",
            createBtn: "Create",
          },

          form: {
            firstName: "First name",
            lastName: "Last name",
            middleName: "Middle name",
            birthDate: "Birth date",
            gender: "Gender",
            phone: "Phone",
            phonePlaceholder: "+7 ...",
            email: "Email",
            address: "Address",
            comment: "Comment",
          },

          gender: {
            u: "U (Unknown)",
            m: "M (Male)",
            f: "F (Female)",
            o: "O (Other)",
          },

          errors: {
            firstLastRequired: "first_name and last_name are required",
          },

          pager: {
            prev: "‹ Previous",
            next: "Next ›",
          },
        },
      },

      nav: {
        home: "Home",
        doctor: "Doctor",
        admin: "Admin",
        appointments: "Appointments",
        calendar: "Calendar",
        schedule: "Schedule",
        visitNotes: "Visit notes",
        patients: "Patients",
        timeOff: "Time-off",
        doctors: "Doctors",
        services: "Services",
        rooms: "Rooms",
      },

      auth: {
        login: "Login",
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        signingIn: "Signing in...",
      },

      home: {
        title: "Doctor CRM",
        subtitle:
          "Internal system for clinics to manage appointments, doctors, patients, services and rooms in one place.",
        badges: {
          roleAccess: "Role-based access",
          calendar: "Appointments & calendar",
          adminCrud: "Admin panel CRUD",
        },
        sections: {
          who: {
            title: "Who can log in",
            text: "Only admins and doctors can access the system. Patients do not log in here.",
          },
          admin: {
            title: "Admin",
            text: "Manage doctors, patients, appointments, services and rooms. View schedules and audit logs.",
          },
          doctor: {
            title: "Doctor",
            text: "View weekly calendar and appointments, change statuses, work with patient list and visit notes.",
          },
        },
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ru",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
