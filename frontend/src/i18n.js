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
        emptyDash: "—",
      },

      nav: {
        search: "Глобальный поиск",
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
      searchPage: {
        title: "Глобальный поиск",
        placeholder: "Поиск по пациентам, услугам, записям...",
        loading: "Ищем...",
        patients: "Пациенты",
        services: "Услуги",
        appointments: "Записи",
        empty: "Ничего не найдено",
        open: "Открыть",
        phone: "Телефон",
        code: "Код",
        duration: "Длительность",
        price: "Цена",
        patient: "Пациент",
        doctor: "Доктор",
        service: "Услуга",
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
            fullNamePlaceholder: "Если оставишь пустым — full_name НЕ отправим",

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

        // ✅ AdminRoomsPage
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

        // ✅ AdminPatientsPage
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

      // ✅ Doctor pages
      doctor: {
        appointments: {
          breadcrumb: "Доктор",
          title: "Записи",
          total: "Всего",
          searchPlaceholder: "Поиск (пациент, доктор и т.д.)",

          filters: {
            status: "Статус",
            all: "Все",
            from: "С",
            to: "По",
          },

          reset: "Сбросить",

          localSearch: "Локальный поиск",
          localSearchHintTitle:
            "Поиск на сервере недоступен. Используем локальный поиск по загруженной странице.",

          listTitle: "Список",

          table: {
            id: "ID",
            start: "Начало",
            end: "Конец",
            status: "Статус",
            patient: "Пациент",
            doctor: "Врач",
            actions: "Действия",
          },

          actions: {
            open: "Открыть",
            confirm: "Подтвердить",
            confirming: "Подтверждаем…",
          },

          empty: "Записей нет",

          pager: {
            prev: "Назад",
            next: "Вперёд",
            page: "Стр. {{page}}",
            showing: "Показано",
          },

          status: {
            SCHEDULED: "Запланировано",
            CONFIRMED: "Подтверждено",
            COMPLETED: "Завершено",
            CANCELLED: "Отменено",
            NO_SHOW: "Не пришёл",
          },
        },
        schedule: {
        breadcrumb: "Доктор",
        title: "Расписание",
        total: "Всего",

        confirmDelete: "Удалить этот интервал расписания?",

        empty: "Расписание ещё не задано",

        weekdays: {
            mon: "Пн",
            tue: "Вт",
            wed: "Ср",
            thu: "Чт",
            fri: "Пт",
            sat: "Сб",
            sun: "Вс",
        },

        form: {
            addTitle: "Добавить интервал",
            editTitle: "Редактировать интервал",

            weekday: "День недели",
            start: "Начало",
            end: "Конец",
            slotMinutes: "Длительность слота (мин)",
            slotHint: "Например: 10 / 15 / 20 / 30",

            create: "Создать",
            save: "Сохранить",
            saving: "Сохраняем...",
            cancel: "Отмена",
            reset: "Сбросить",
        },

        validation: {
            endLater: "Время окончания должно быть позже времени начала.",
            slotMin: "Длительность слота должна быть ≥ 5 минут.",
        },

        table: {
            title: "Интервалы",
            weekday: "День",
            start: "Начало",
            end: "Конец",
            slot: "Слот",
            min: "мин",
        },

        actions: {
            delete: "Удалить",
        },
        },
        visitNotes: {
        breadcrumb: "Доктор",
        title: "Заметки визита",
        total: "Всего",

        patientPrefix: "Пациент",

        create: {
            title: "Создать заметку",
        },

        fields: {
            appointmentId: "ID записи",
            noteText: "Текст заметки",
        },

        placeholders: {
            appointmentId: "например 21",
            noteText: "Напиши заметку…",
        },

        info: {
            appointment: "Запись",
            patient: "Пациент",
        },

        actions: {
            create: "Создать заметку",
            creating: "Создаём...",
            reset: "Сбросить",
            open: "Открыть",
        },

        list: {
            title: "Список заметок",
            empty: "Заметок нет",
        },

        table: {
            id: "ID",
            appointment: "Запись",
            patient: "Пациент",
            created: "Создано",
        },

        pager: {
            prev: "Назад",
            next: "Вперёд",
        },

        errors: {
            invalidAppointment: "Введите корректный ID записи",
            noteRequired: "Это поле обязательно.",
            noPatientOnAppointment:
            "У выбранной записи нет пациента. Выберите запись, где есть пациент.",
        },
        },
        visitNoteDetail: {
        breadcrumb: "Доктор",
        back: "Назад",
        title: "Заметка визита #{{id}}",
        patientPrefix: "Пациент",

        actions: {
            save: "Сохранить",
            saving: "Сохраняем...",
            deleteNote: "Удалить заметку",
            delete: "Удалить",
            deleting: "Удаляем...",
            revert: "Вернуть",
            open: "Открыть",
        },

        confirm: {
            deleteAttachment: "Удалить этот файл?",
            deleteNote: "Удалить эту заметку?",
        },

        details: {
            title: "Детали",
            appointment: "Запись",
            patient: "Пациент",
            created: "Создано",
            updated: "Обновлено",
        },

        fields: {
            noteText: "Текст заметки",
        },

        placeholders: {
            noteText: "Напиши заметку…",
        },

        attachments: {
            title: "Файлы",
            chooseFile: "Выбрать файл",
            upload: "Загрузить",
            uploading: "Загружаем...",
            empty: "Файлов нет",
            id: "ID",
        },
        },
        patients: {
        breadcrumb: "Доктор",
        title: "Клиенты",
        total: "Всего",
        searchPlaceholder: "Поиск клиента",
        reset: "Сбросить",

        errorTitle: "Ошибка",

        badgeNew: "Новый",
        actionsTitle: "Действия",

        lastAppointments: "Последние записи",
        noAppointments: "Записей нет",

        open: "Открыть",
        empty: "Ничего не найдено",

        pager: {
            prev: "‹ Назад",
            next: "Вперёд ›",
        },
        },
        patientDetail: {
        backToPatients: "Клиенты",
        breadcrumbEdit: "Редактирование клиента",

        tabs: {
            profile: "Профиль клиента",
            history: "История посещений",
        },

        errorTitle: "Ошибка",

        sections: {
            client: "Клиент",
            clientStatus: "Статус клиента",
            additional: "Дополнительная информация",
            history: "История посещений",
        },

        fields: {
            fullName: "ФИО",
            phone: "Телефон",
            email: "Почта",
            birthDate: "Дата рождения",
            gender: "Пол",
            status: "Статус",
            debt: "Долг",
            discount: "Скидка",
        },

        gender: {
            male: "Мужской",
            female: "Женский",
        },

        emptyHistory: "Записей нет",

        table: {
            id: "ID",
            date: "Дата",
            doctor: "Врач",
            service: "Услуга",
            room: "Кабинет",
            status: "Статус",
        },

        actions: {
            open: "Открыть",
        },

        fallback: {
            doctor: "Врач #{{id}}",
            service: "Услуга #{{id}}",
            room: "Кабинет #{{id}}",
        },
        },
        timeOff: {
        breadcrumb: "Доктор",
        title: "Отгулы",
        total: "Всего: {{total}}",
        next: "Ближайший:",

        errorTitle: "Ошибка",
        confirmDelete: "Удалить этот интервал отгула?",

        empty: "Пока нет отгулов",

        form: {
            addTitle: "Добавить интервал",
            editTitle: "Редактировать интервал #{{id}}",
            start: "Начало",
            end: "Конец",
            reason: "Причина",
            reasonPlaceholder: "Причина (необязательно)",
            create: "Создать",
            clear: "Очистить",
        },

        list: {
            title: "Интервалы",
            refresh: "Обновить",
            refreshing: "Обновляем...",
        },

        table: {
            start: "Начало",
            end: "Конец",
            reason: "Причина",
        },

        actions: {
            edit: "Редактировать",
            delete: "Удалить",
        },

        errors: {
            unknown: "Неизвестная ошибка",
        },
        },
        appointmentDetail: {
        breadcrumb: "Доктор",
        back: "← Назад",
        title: "Запись",

        details: {
            title: "Детали",
            start: "Начало",
            end: "Конец",
            patient: "Пациент",
            doctor: "Врач",
            service: "Услуга",
            room: "Кабинет",
            reason: "Причина",
            comment: "Комментарий",
        },

        actions: {
            title: "Действия",
            changeStatus: "Изменить статус",
            selectPlaceholder: "-- выбрать --",

            quick: {
            confirm: "Подтвердить",
            complete: "Завершить",
            noShow: "Не пришёл",
            cancel: "Отменить",
            },

            cannotChange: "Статус нельзя изменить из состояния: {{status}}.",
        },

        visitNotes: {
            title: "Заметки визита",
            list: "Список заметок",
            openOrCreate: "Открыть / Создать заметку",
        },
        },

        // ✅ DoctorWeekCalendarPage (NEW)
        week: {
          breadcrumb: "Журнал",
          title: "Журнал",

          today: "Сегодня",

          spec: {
            all: "Все специальности",
          },

          table: {
            head: "График",
          },

          noData: "Нет данных",
          noAppts: "На выбранный день нет записей",

          free: "Доступно",

          status: {
            SCHEDULED: "Запланировано",
            CONFIRMED: "Подтверждено",
            COMPLETED: "Завершено",
            CANCELLED: "Отменено",
            NO_SHOW: "Не пришёл",
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
        emptyDash: "—",
      },

      nav: {
        search: "Global search",
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
      searchPage: {
        title: "Global search",
        placeholder: "Search patients, services, appointments...",
        loading: "Searching...",
        patients: "Patients",
        services: "Services",
        appointments: "Appointments",
        empty: "No results",
        open: "Open",
        phone: "Phone",
        code: "Code",
        duration: "Duration",
        price: "Price",
        patient: "Patient",
        doctor: "Doctor",
        service: "Service",
    },

      auth: {
        login: "Login",
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        signingIn: "Signing in...",
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
            fullNamePlaceholder: "If empty — we will NOT send full_name",

            room: "Room",
            roomNotSelected: "— not selected —",

            specialization: "Profession / specialization",
            phone: "Phone",
          },
        },

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

      doctor: {
        appointments: {
          breadcrumb: "Doctor",
          title: "Appointments",
          total: "Total",
          searchPlaceholder: "Search (patient, doctor, etc.)",

          filters: {
            status: "Status",
            all: "All",
            from: "From",
            to: "To",
          },

          reset: "Reset",

          localSearch: "Local search",
          localSearchHintTitle:
            "Server search is not available. Using local search on the loaded page.",

          listTitle: "List",

          table: {
            id: "ID",
            start: "Start",
            end: "End",
            status: "Status",
            patient: "Patient",
            doctor: "Doctor",
            actions: "Actions",
          },

          actions: {
            open: "Open",
            confirm: "Confirm",
            confirming: "Confirming…",
          },

          empty: "No appointments",

          pager: {
            prev: "Prev",
            next: "Next",
            page: "Page {{page}}",
            showing: "Showing",
          },

          status: {
            SCHEDULED: "Scheduled",
            CONFIRMED: "Confirmed",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
            NO_SHOW: "No show",
          },
        },
        schedule: {
        breadcrumb: "Doctor",
        title: "Schedule",
        total: "Total",

        confirmDelete: "Delete this schedule interval?",

        empty: "No schedule yet",

        weekdays: {
            mon: "Mon",
            tue: "Tue",
            wed: "Wed",
            thu: "Thu",
            fri: "Fri",
            sat: "Sat",
            sun: "Sun",
        },

        form: {
            addTitle: "Add interval",
            editTitle: "Edit interval",

            weekday: "Weekday",
            start: "Start",
            end: "End",
            slotMinutes: "Slot minutes",
            slotHint: "Example: 10 / 15 / 20 / 30",

            create: "Create",
            save: "Save",
            saving: "Saving...",
            cancel: "Cancel",
            reset: "Reset",
        },

        validation: {
            endLater: "End time must be later than start time.",
            slotMin: "Slot minutes must be >= 5.",
        },

        table: {
            title: "Intervals",
            weekday: "Weekday",
            start: "Start",
            end: "End",
            slot: "Slot",
            min: "min",
        },

        actions: {
            delete: "Delete",
        },
        },
        visitNotes: {
        breadcrumb: "Doctor",
        title: "Visit notes",
        total: "Total",

        patientPrefix: "Patient",

        create: {
            title: "Create note",
        },

        fields: {
            appointmentId: "Appointment ID",
            noteText: "Note text",
        },

        placeholders: {
            appointmentId: "e.g. 21",
            noteText: "Write a note…",
        },

        info: {
            appointment: "Appointment",
            patient: "Patient",
        },

        actions: {
            create: "Create note",
            creating: "Creating...",
            reset: "Reset",
            open: "Open",
        },

        list: {
            title: "Notes list",
            empty: "No notes",
        },

        table: {
            id: "ID",
            appointment: "Appointment",
            patient: "Patient",
            created: "Created",
        },

        pager: {
            prev: "Prev",
            next: "Next",
        },

        errors: {
            invalidAppointment: "Enter valid Appointment ID",
            noteRequired: "This field is required.",
            noPatientOnAppointment:
            "Selected appointment has no patient. Pick an appointment that has a patient.",
        },
        },
        visitNoteDetail: {
        breadcrumb: "Doctor",
        back: "Back",
        title: "Visit note #{{id}}",
        patientPrefix: "Patient",

        actions: {
            save: "Save",
            saving: "Saving...",
            deleteNote: "Delete note",
            delete: "Delete",
            deleting: "Deleting...",
            revert: "Revert",
            open: "Open",
        },

        confirm: {
            deleteAttachment: "Delete this attachment?",
            deleteNote: "Delete this note?",
        },

        details: {
            title: "Details",
            appointment: "Appointment",
            patient: "Patient",
            created: "Created",
            updated: "Updated",
        },

        fields: {
            noteText: "Note text",
        },

        placeholders: {
            noteText: "Write note…",
        },

        attachments: {
            title: "Attachments",
            chooseFile: "Choose file",
            upload: "Upload",
            uploading: "Uploading...",
            empty: "No attachments",
            id: "ID",
        },
        },
        patients: {
        breadcrumb: "Doctor",
        title: "Patients",
        total: "Total",
        searchPlaceholder: "Search patient",
        reset: "Reset",

        errorTitle: "Error",

        badgeNew: "New",
        actionsTitle: "Actions",

        lastAppointments: "Last appointments",
        noAppointments: "No appointments",

        open: "Open",
        empty: "Nothing found",

        pager: {
            prev: "‹ Previous",
            next: "Next ›",
        },
        },
        patientDetail: {
        backToPatients: "Patients",
        breadcrumbEdit: "Edit patient",

        tabs: {
            profile: "Patient profile",
            history: "Visit history",
        },

        errorTitle: "Error",

        sections: {
            client: "Patient",
            clientStatus: "Patient status",
            additional: "Additional information",
            history: "Visit history",
        },

        fields: {
            fullName: "Full name",
            phone: "Phone",
            email: "Email",
            birthDate: "Birth date",
            gender: "Gender",
            status: "Status",
            debt: "Debt",
            discount: "Discount",
        },

        gender: {
            male: "Male",
            female: "Female",
        },

        emptyHistory: "No records",

        table: {
            id: "ID",
            date: "Date",
            doctor: "Doctor",
            service: "Service",
            room: "Room",
            status: "Status",
        },

        actions: {
            open: "Open",
        },

        fallback: {
            doctor: "Doctor #{{id}}",
            service: "Service #{{id}}",
            room: "Room #{{id}}",
        },
        },
        timeOff: {
        breadcrumb: "Doctor",
        title: "Time-off",
        total: "Total: {{total}}",
        next: "Next:",

        errorTitle: "Error",
        confirmDelete: "Delete this time-off interval?",

        empty: "No time-off yet",

        form: {
            addTitle: "Add interval",
            editTitle: "Edit interval #{{id}}",
            start: "Start",
            end: "End",
            reason: "Reason",
            reasonPlaceholder: "Reason (optional)",
            create: "Create",
            clear: "Clear",
        },

        list: {
            title: "Intervals",
            refresh: "Refresh",
            refreshing: "Refreshing...",
        },

        table: {
            start: "Start",
            end: "End",
            reason: "Reason",
        },

        actions: {
            edit: "Edit",
            delete: "Delete",
        },

        errors: {
            unknown: "Unknown error",
        },
        },
        appointmentDetail: {
        breadcrumb: "Doctor",
        back: "← Back",
        title: "Appointment",

        details: {
            title: "Details",
            start: "Start",
            end: "End",
            patient: "Patient",
            doctor: "Doctor",
            service: "Service",
            room: "Room",
            reason: "Reason",
            comment: "Comment",
        },

        actions: {
            title: "Actions",
            changeStatus: "Change status",
            selectPlaceholder: "-- select --",

            quick: {
            confirm: "Confirm",
            complete: "Complete",
            noShow: "No show",
            cancel: "Cancel",
            },

            cannotChange: "Status cannot be changed from: {{status}}.",
        },

        visitNotes: {
            title: "Visit notes",
            list: "Notes list",
            openOrCreate: "Open / Create note",
        },
        },


        // ✅ DoctorWeekCalendarPage (NEW)
        week: {
          breadcrumb: "Journal",
          title: "Journal",

          today: "Today",

          spec: {
            all: "All specializations",
          },

          table: {
            head: "Schedule",
          },

          noData: "No data",
          noAppts: "No appointments for the selected day",

          free: "Available",

          status: {
            SCHEDULED: "Scheduled",
            CONFIRMED: "Confirmed",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
            NO_SHOW: "No show",
          },
        },
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

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export default i18n;
