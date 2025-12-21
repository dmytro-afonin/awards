import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AsyncPipe, NgOptimizedImage, NgStyle} from '@angular/common';
import {LinkComponent} from '../link/link.component';
import {Auth, signInWithPopup, GoogleAuthProvider, user, User} from '@angular/fire/auth';
import {collection, doc, Firestore, getDoc, setDoc, updateDoc, writeBatch} from '@angular/fire/firestore';
import {switchMap} from 'rxjs';


interface UserInterface {
  id: string;
  name: string;
  votes: Record<string, number>; //nomineeId / candidateId
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, LinkComponent, NgStyle],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppComponent {
  readonly menuItems: any[] = [
    {route: '/nominees', title: 'Номинации'}
  ];
  readonly #auth = inject(Auth);
  readonly #fs: Firestore = inject(Firestore); // inject Cloud Firestore

  user: User | null = null;
  userData: any;
  constructor() {
    // Listen to auth state changes
    user(this.#auth).pipe(
      // For each auth state change, check and sync user
      switchMap(async (authUser: User | null) => {
        this.user = authUser;
        if (!authUser) return;
        await this.#syncUser(authUser);
      })
    ).subscribe();
  }

  togglePresenterMode() {
    if (!this.userData?.admin) {
      return;
    }
    this.#updateField('user', this.userData.id, 'presenterMode', !this.userData.presenterMode).then();
  }

  async #updateField(collectionName: string, docId: string, fieldName: string, newValue: any) {
    const docRef = doc(this.#fs, collectionName, docId);
    return updateDoc(docRef, {[fieldName]: newValue});
  }

  createData(): void {
    const candidates = [
      {
        "id": "geimkom_i_100_video",
        "name": "Гейсмком и 100 видео пацюка которые никто не смотрел",
        "image": "/n_1_1.jpg"
      },
      {
        "id": "ze_geim_evards",
        "name": "Зе Гейм Эвардс и астро бот.",
        "image": "/n_1_2.jpg"
      },
      {
        "id": "evrovidenie",
        "name": "Евровидение и экспертное мнение знатоков",
        "image": "/n_1_3.jpg"
      },
      {
        "id": "boi_usika",
        "name": "Бой Усика где Димас кричал 'Убей его нахуй'.",
        "image": "/n_1_4.jpg"
      },
      {
        "id": "parik",
        "name": "Гарик",
        "image": "/n_2_1.jpg"
      },
      {
        "id": "persik",
        "name": "персик",
        "image": "/n_2_2.jpg"
      },
      {
        "id": "shmelak",
        "name": "Шрэклок",
        "image": "/n_2_3.jpg"
      },
      {
        "id": "korol_tomata",
        "name": "кроль томата",
        "image": "/n_2_4.jpg"
      },
      {
        "id": "gerald",
        "name": "Геральд",
        "image": "/n_2_5.jpg"
      },
      {
        "id": "luncha",
        "name": "Лучна",
        "image": "/n_2_6.jpg"
      },
      {
        "id": "dayzi",
        "name": "Дейзи",
        "image": "/n_2_7.jpg"
      },
      {
        "id": "tomat",
        "name": "Томат",
        "image": "/n_3_1.jpg"
      },
      {
        "id": "turbina",
        "name": "турбина",
        "image": "/n_3_2.jpg"
      },
      {
        "id": "tomatronus",
        "name": "томатронус",
        "image": "/n_3_3.jpg"
      },
      {
        "id": "artem",
        "name": "артем",
        "image": "/n_3_4.jpg"
      },
      {
        "id": "turbonasos",
        "name": "турбонасос",
        "image": "/n_3_5.jpg"
      },
      {
        "id": "talibeius",
        "name": "Талибанус",
        "image": "/n_3_6.jpg"
      },
      {
        "id": "muravei_na_zapupe",
        "name": "Муравей на запупе",
        "image": "/n_4_1.jpg"
      },
      {
        "id": "bolshe_banok",
        "name": "Больше банок с калом богу банок с калом",
        "image": "/n_4_2.jpg"
      },
      {
        "id": "pokupka_pikselya",
        "name": "Покупка пикселя",
        "image": "/n_4_3.jpg"
      },
      {
        "id": "ander_za_veter",
        "name": "Андер за вотер",
        "image": "/n_4_4.jpg"
      },
      {
        "id": "pobeda_nad_dadanom",
        "name": "победа над раданом",
        "image": "/n_4_5.jpg"
      },
      {
        "id": "sloveniya1",
        "name": "словения",
        "image": "/n_5_1.jpg"
      },
      {
        "id": "sloveniya2",
        "name": "словения",
        "image": "/n_5_2.jpg"
      },
      {
        "id": "polsha1",
        "name": "польша",
        "image": "/n_5_3.jpg"
      },
      {
        "id": "bolgariya1",
        "name": "болгария",
        "image": "/n_5_4.jpg"
      },
      {
        "id": "amerika1",
        "name": "америка",
        "image": "/n_5_5.jpg"
      },
      {
        "id": "chekia",
        "name": "Чехия",
        "image": "/n_6_1.jpg"
      },
      {
        "id": "ukraina",
        "name": "Украина",
        "image": "/n_6_2.jpg"
      },
      {
        "id": "polsha2",
        "name": "польша",
        "image": "/n_6_3.jpg"
      },
      {
        "id": "bolgariya2",
        "name": "болгария",
        "image": "/n_6_4.jpg"
      },
      {
        "id": "amerika2",
        "name": "америка",
        "image": "/n_6_5.jpg"
      },
      {
        "id": "dimas",
        "name": "Димас",
        "image": "/n_7_1.jpg"
      },
      {
        "id": "patsok",
        "name": "Пацюк",
        "image": "/n_7_2.jpg"
      },
      {
        "id": "tomas",
        "name": "Томас",
        "image": "/n_7_3.jpg"
      },
      {
        "id": "artok",
        "name": "Артек",
        "image": "/n_7_4.jpg"
      },
      {
        "id": "dimas_slovenskii",
        "name": "Димас словенский",
        "image": "/n_7_5.jpg"
      },
      {
        "id": "pavuk",
        "name": "Павук",
        "image": "/n_7_6.jpg"
      },
      {
        "id": "supermarket_simulator",
        "name": "Supermarket Simulator",
        "image": "/n_8_1.jpg"
      },
      {
        "id": "farming_simulator",
        "name": "Farming Simulator 25",
        "image": "/n_8_2.jpg"
      },
      {
        "id": "ranch_simulator",
        "name": "Ranch Simulator",
        "image": "/n_8_3.jpg"
      },
      {
        "id": "the_long_drive",
        "name": "The Long Drive",
        "image": "/n_8_4.jpg"
      },
      {
        "id": "trailmakers",
        "name": "Trailmakers",
        "image": "/n_8_5.jpg"
      },
      {
        "id": "my_summer_car",
        "name": "my summer car",
        "image": "/n_8_6.jpg"
      },
      {
        "id": "armatura",
        "name": "Арматура",
        "image": "/n_9_1.jpg"
      },
      {
        "id": "arkhangel",
        "name": "Архангел",
        "image": "/n_9_2.jpg"
      },
      {
        "id": "artok2",
        "name": "Артек",
        "image": "/n_9_3.jpg"
      },
      {
        "id": "buodinkban",
        "name": "Ву Один Кан",
        "image": "/n_9_4.jpg"
      },
      {
        "id": "arurik",
        "name": "Арурик",
        "image": "/n_9_5.jpg"
      },
      {
        "id": "dimmidron",
        "name": "Диммидрон",
        "image": "/n_10_1.jpg"
      },
      {
        "id": "pumba",
        "name": "Пумба",
        "image": "/n_10_2.jpg"
      },
      {
        "id": "pangalin",
        "name": "Пангалин",
        "image": "/n_10_3.jpg"
      },
      {
        "id": "pikachuk",
        "name": "Пикачук",
        "image": "/n_10_4.jpg"
      },
      {
        "id": "dimas_zashipkeril_persika",
        "name": "Димас зашкерил Персика",
        "image": "/n_11_1.jpg"
      },
      {
        "id": "arturik_spizdia_avatarku",
        "name": "Артурик спиздил аватарку пацюка",
        "image": "/n_11_2.jpg"
      },
      {
        "id": "mikha_sbezhalsya",
        "name": "Миха съебался в америчку и оставил кентов в загнивающей европе",
        "image": "/n_11_3.jpg"
      },
      {
        "id": "tomas_obosral_sloveniyu",
        "name": "Игорь обосрал Словению и потом очень долго съебывался",
        "image": "/n_11_4.jpg"
      },
      {
        "id": "artur_tozhe_obosral",
        "name": "Артур тоже обосрал словению и съебался",
        "image": "/n_11_5.jpg"
      },
      {
        "id": "patsuk_na_gey",
        "name": "Пацюк на геймскоме",
        "image": "/n_12_1.jpg",
      },
      {
        "id": "misha_v_amerike",
        "name": "Миша в Америчке",
        "image": "/n_12_2.jpg",
      },
      {
        "id": "oleh_na_lastochke",
        "name": "Олег на Ласточке повсюду",
        "image": "/n_12_3.jpg",
      },
      {
        "id": "dimas_v_geyrope",
        "name": "Димас в гейропе",
        "image": "/n_12_4.jpg",
      },
      {
        "id": "persik_nashel_dom",
        "name": "Персик нашел себе дом",
        "image": "/n_13_1.jpg"
      },
      {
        "id": "artur_oformil_doki",
        "name": "Артур быстро оформил все доки в сло а потом разоформил",
        "image": "/n_13_2.jpg"
      },
      {
        "id": "patsok_slomal",
        "name": "пацюк сломал писюн",
        "image": "/n_13_3.jpg"
      },
      {
        "id": "mikha_svalil",
        "name": "Миха свалил в америку",
        "image": "/n_13_4.jpg"
      },
      {
        "id": "divan_tomas",
        "name": "Диван (томас)",
        "image": "/n_14_1.jpg"
      },
      {
        "id": "divan_dlya_persika",
        "name": "диван для персика",
        "image": "/n_14_2.jpg"
      },
      {
        "id": "chernyi_kozhanyi",
        "name": "черный кожаный",
        "image": "/n_14_3.jpg"
      },
      {
        "id": "krovat_patsoka",
        "name": "кровать пацюка",
        "image": "/n_14_4.jpg"
      },
      {
        "id": "igor_spal",
        "name": "Игорь спал под шторой",
        "image": "/n_15_1.jpg"
      },
      {
        "id": "oleg_gde_istorii",
        "name": "Олег где истории шамана?",
        "image": "/n_15_2.jpg"
      },
      {
        "id": "patsok_sdelal",
        "name": "пацюк сделал обрезание",
        "image": "/n_15_3.jpg"
      },
      {
        "id": "lyuboe_peresechenie",
        "name": "любое пересечение границы",
        "image": "/n_15_4.jpg"
      },
      {
        "id": "igor_dengi",
        "name": "Игорь (Деньги)",
        "image": "/n_16_1.jpg"
      },
      {
        "id": "dimas_svyazi",
        "name": "Димас (Связи)",
        "image": "/n_16_2.jpg"
      },
      {
        "id": "arturchik_v_poiskakh",
        "name": "Артурчик в поисках места для себя",
        "image": "/n_16_3.jpg"
      },
      {
        "id": "investory",
        "name": "инвесторы",
        "image": "/n_16_4.jpg"
      },
      {
        "id": "napalennyi_pauk",
        "name": "Напаленный паук",
        "image": "/n_17_1.jpg"
      },
      {
        "id": "napatsochennyi_patsok",
        "name": "Напацюченный пацюк",
        "image": "/n_17_2.jpg"
      },
      {
        "id": "beshoshnyi_dimas",
        "name": "БЕСШОВНЫЙ ДИМАС",
        "image": "/n_17_3.jpg"
      },
      {
        "id": "odesskii_dimas",
        "name": "ОДЕССКИЙ ДИМАС БЕЗ СВЕТА",
        "image": "/n_17_4.jpg"
      },
      {
        "id": "nadivanini_divan",
        "name": "Надиваненый диван",
        "image": "/n_17_5.jpg"
      },
      {
        "id": "natertaya_armatura",
        "name": "Каленая арматура",
        "image": "/n_17_6.jpg"
      },
      {
        "id": "ramki_sidyat",
        "name": "Рекич сидит на жопе ровно",
        "image": "/n_18_1.jpg"
      },
      {
        "id": "olezka_nikto",
        "name": "Олежка. Никто не знал шо он съебывает.",
        "image": "/n_18_2.jpg"
      },
      {
        "id": "mikha_pervyi",
        "name": "Миха - первый лодочник",
        "image": "/n_18_3.jpg"
      },
      {
        "id": "arterik_sbezhatsya",
        "name": "Артерик съебаться любой ценой",
        "image": "/n_18_4.jpg"
      },
      {
        "id": "vladie_popytka",
        "name": "Владик - моя попытка номер 2",
        "image": "/n_18_5.jpg"
      },
      {
        "id": "vadim_menshe_ves",
        "name": "Вадим: меньне знаешь - крепче спишь",
        "image": "/n_18_6.jpg"
      },
      {
        "id": "artur_ne_vyshel",
        "name": "Артук не вышел из дискорда",
        "image": "/n_19_1.jpg"
      },
      {
        "id": "ebya_belok",
        "name": "Ебя Белок",
        "image": "/n_19_2.jpg"
      },
      {
        "id": "patsok_i_shtora",
        "name": "пацюк и штора",
        "image": "/n_19_3.jpg"
      },
      {
        "id": "shtura_patsoka",
        "name": "Шкурка пацюка",
        "image": "/n_19_4.jpg"
      },
      {
        "id": "beschovnost",
        "name": "Димасяча бесшовность",
        "image": "/n_19_5.jpg"
      },
      {
        "id": "under_der_woter",
        "name": "Under the water",
        "image": "/n_19_6.jpg"
      },
      {
        "id": "luchshe_chem_nechego",
        "name": "Лучше чем ничего",
        "image": "/n_19_7.jpg"
      },
      {
        "id": "musorka_olega",
        "name": "Мусорка олега",
        "image": "/n_20_1.jpg"
      },
      {
        "id": "musorka_dimasa",
        "name": "Мусорка Димаса в Мариборе",
        "image": "/n_20_2.jpg"
      },
      {
        "id": "musorka_igorya",
        "name": "Мусорка Игоря",
        "image": "/n_20_3.jpg"
      },
      {
        "id": "musorka_dimasa_odessa",
        "name": "Мусорка Димаса в Одессе",
        "image": "/n_20_4.jpg"
      },
      {
        "id": "musorka_tomasa",
        "name": "мусорка томаса",
        "image": "/n_20_5.jpg"
      },
      {
        "id": "musorka_vadima",
        "name": "Мусорка Вадима",
        "image": "/n_20_6.jpg"
      },
      {
        "id": "musorka_miha",
        "name": "Мусорка Михаила",
        "image": "/n_20_7.jpg"
      },
      {
        "id": "musorka_artuk",
        "name": "Мусорка Артука",
        "image": "/n_20_8.jpg"
      },
      {
        "id": "musorka_vlad",
        "name": "Мусорка Владика",
        "image": "/n_20_9.jpg"
      },
      {
        "id": "1",
        "name": "1",
        "image": "/n_21_1.jpg"
      },
      {
        "id": "2",
        "name": "2",
        "image": "/n_21_2.jpg"
      },
      {
        "id": "3",
        "name": "3",
        "image": "/n_21_3.jpg"
      },
      {
        "id": "zhdalker2",
        "name": "Ждалкер 2",
        "image": "/n_22_1.jpg"
      },
      {
        "id": "marvel_rivals",
        "name": "Marvel Rivals",
        "image": "/n_22_2.jpg"
      },
      {
        "id": "astrobot",
        "name": "астробот",
        "image": "/n_22_3.jpg"
      },
      {
        "id": "path_of_exile",
        "name": "Path of Exile 2",
        "image": "/n_22_4.jpg"
      },
      {
        "id": "helldivers2",
        "name": "HELLDIVERS™ 2",
        "image": "/n_22_5.jpg"
      },
      {
        "id": "steam_deck",
        "name": "Steam Deck",
        "image": "/n_22_6.jpg"
      },
      {
        "id": "wukong",
        "name": "Wu Kong",
        "image": "/n_22_7.jpg"
      },
      {
        "id": "satisfactory",
        "name": "Satisfactory",
        "image": "/n_22_8.jpg"
      },
      {
        "id": "phantom_liberty",
        "name": "Phantom Liberty",
        "image": "/n_22_9.jpg"
      },
      {
        "id": "kc",
        "name": "КС",
        "image": "/n_23_1.jpg"
      },
      {
        "id": "marvel_rivals2",
        "name": "Marvel Rivals",
        "image": "/n_23_2.jpg"
      },
      {
        "id": "my_summer_car2",
        "name": "my summer car",
        "image": "/n_23_3.jpg"
      },
      {
        "id": "stalker",
        "name": "Сталкер",
        "image": "/n_23_4.jpg"
      },
      {
        "id": "konkord",
        "name": "Конкорд",
        "image": "/n_24_1.jpg"
      },
      {
        "id": "diablo3",
        "name": "Диабла 3",
        "image": "/n_24_2.jpg"
      },
      {
        "id": "helldivers",
        "name": "хелдрайверс",
        "image": "/n_24_3.jpg"
      },
      {
        "id": "zhiga_v_may",
        "name": "Жига в май саммер карс",
        "image": "/n_24_4.jpg"
      },
      {
        "id": "lays_of_pi",
        "name": "Лайз оф пи",
        "image": "/n_25_1.jpg"
      },
      {
        "id": "vukong",
        "name": "вуконг",
        "image": "/n_25_2.jpg"
      },
      {
        "id": "dls_dlya_enderlinga",
        "name": "длс для ендерлинга",
        "image": "/n_25_3.jpg"
      },
      {
        "id": "kukhnya_v_maribore",
        "name": "кухня в мариборе",
        "image": "/n_25_4.jpg"
      },
      {
        "id": "vecherinki_pdiddy",
        "name": "Вечеринки PDiddy не доходят до уровня николаева",
        "image": "/n_26_1.jpg"
      },
      {
        "id": "ukrainskaya_diaspora",
        "name": "Украинская диаспора страдает от отсутсвия суши в бебирбор",
        "image": "/n_26_2.jpg"
      },
      {
        "id": "trampaharis",
        "name": "Трампахарис",
        "image": "/n_26_3.jpg"
      },
      {
        "id": "protest_gruzi",
        "name": "протесты в грузии",
        "image": "/n_26_4.jpg"
      },
      {
        "id": "protest_korea",
        "name": "протесты в коерее",
        "image": "/n_26_5.jpg"
      },
      {
        "id": "kursk",
        "name": "курск",
        "image": "/n_26_6.jpg"
      },
      {
        "id": "sirya",
        "name": "сиря",
        "image": "/n_26_7.jpg"
      },
      {
        "id": "sector_vs_izra",
        "name": "сектор газа вс израиль",
        "image": "/n_26_8.jpg"
      },
      {
        "id": "na_menya_gladit",
        "name": "на меня гладит игриво пиво пиво пиво пиво",
        "image": "/n_27_1.jpg"
      },
      {
        "id": "tak_tak_tak",
        "name": "так так так понятно? дААААА",
        "image": "/n_27_2.jpg"
      },
      {
        "id": "tranbalon",
        "name": "транбалон",
        "image": "/n_27_3.jpg"
      },
      {
        "id": "macbook",
        "name": "Макбук",
        "image": "/n_28_1.jpg"
      },
      {
        "id": "pk",
        "name": "Пк",
        "image": "/n_28_2.jpg"
      },
      {
        "id": "stimdeck",
        "name": "Стимдек",
        "image": "/n_28_3.jpg"
      },
      {
        "id": "ps5",
        "name": "PS5",
        "image": "/n_28_4.jpg"
      },
      {
        "id": "noutbuk",
        "name": "ноутбук",
        "image": "/n_28_5.jpg"
      },
      {
        "id": "piksel_olega",
        "name": "пиксель олега",
        "image": "/n_28_6.jpg"
      },
      {
        "id": "witcher4",
        "name": "Witcher 4",
        "image": "/n_29_1.jpg"
      },
      {
        "id": "monsterhunter",
        "name": "Монстерхантер",
        "image": "/n_29_2.jpg"
      },
      {
        "id": "gtab",
        "name": "Гта 6",
        "image": "/n_29_3.jpg"
      },
      {
        "id": "death_stranding2",
        "name": "death stranding 2",
        "image": "/n_29_4.jpg"
      },
      {
        "id": "lize_of_pi",
        "name": "Lies of pi",
        "image": "/n_29_5.jpg"
      }
    ];
    const nominees = [
      {
        "title": "Лучший ивент года",
        "description": "",
        "image": "/n_1.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["geimkom_i_100_video", "ze_geim_evards", "evrovidenie", "boi_usika"]
      },
      {
        "title": "лучший питомец для всего дискорда",
        "description": "",
        "image": "/n_2.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["parik", "persik", "shmelak", "korol_tomata", "gerald", "luncha", "dayzi"]
      },
      {
        "title": "Лучшая интерпретация имени Томаса",
        "description": "",
        "image": "/n_3.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["tomat", "turbina", "tomatronus", "artem", "turbonasos", "talibeius"]
      },
      {
        "title": "Самый смешной случай с Олегом",
        "description": "",
        "image": "/n_4.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["muravei_na_zapupe", "bolshe_banok", "pokupka_pikselya", "ander_za_veter", "pobeda_nad_dadanom"]
      },
      {
        "title": "Лучшая словения года",
        "description": "",
        "image": "/n_5.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["sloveniya1", "sloveniya2", "polsha1", "bolgariya1", "amerika1"]
      },
      {
        "title": "Лучшая страна для жизни",
        "description": "",
        "image": "/n_6.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["chekia", "ukraina", "polsha2", "bolgariya2", "amerika2"]
      },
      {
        "title": "Лучшая аватарка в дс",
        "description": "",
        "image": "/n_7.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["dimas", "patsok", "tomas", "artok", "dimas_slovenskii", "pavuk"]
      },
      {
        "title": "Лучшая игра категории Г в которую играли",
        "description": "",
        "image": "/n_8.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["supermarket_simulator", "farming_simulator", "ranch_simulator", "the_long_drive", "trailmakers", "my_summer_car"]
      },
      {
        "title": "Лучшая интерпретация имени Артура",
        "description": "",
        "image": "/n_9.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["armatura", "arkhangel", "artok2", "buodinkban", "arurik"]
      },
      {
        "title": "Лучший ник для Димаса",
        "description": "",
        "image": "/n_10.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["dimmidron", "pumba", "pangalin", "pikachuk"]
      },
      {
        "title": "пацючий мув года",
        "description": "",
        "image": "/n_11.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["dimas_zashipkeril_persika", "arturik_spizdia_avatarku", "mikha_sbezhalsya", "tomas_obosral_sloveniyu", "artur_tozhe_obosral"]
      },
      {
        "title": "путешественник года",
        "description": "",
        "image": "/n_12.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["patsuk_na_gey", "misha_v_amerike", "oleh_na_lastochke", "dimas_v_geyrope"]
      },
      {
        "title": "Самая быстрая рука на диком западе",
        "description": "",
        "image": "/n_13.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["persik_nashel_dom", "artur_oformil_doki", "patsok_slomal", "mikha_svalil"]
      },
      {
        "title": "самый мягкий диван",
        "description": "",
        "image": "/n_14.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["divan_tomas", "divan_dlya_persika", "chernyi_kozhanyi", "krovat_patsoka"]
      },
      {
        "title": "лучшая история года",
        "description": "",
        "image": "/n_15.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["igor_spal", "oleg_gde_istorii", "patsok_sdelal", "lyuboe_peresechenie"]
      },
      {
        "title": "самый глубокий мыслитель",
        "description": "",
        "image": "/n_16.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["igor_dengi", "dimas_svyazi", "arturchik_v_poiskakh", "investory"]
      },
      {
        "title": "Первый пацюк на селе",
        "description": "",
        "image": "/n_17.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["napalennyi_pauk", "napatsochennyi_patsok", "beshoshnyi_dimas", "odesskii_dimas", "natertaya_armatura","nadivanini_divan"]
      },
      {
        "title": "Самый эпический сьеб",
        "description": "",
        "image": "/n_18.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["ramki_sidyat", "olezka_nikto", "mikha_pervyi", "arterik_sbezhatsya", "vladie_popytka", "vadim_menshe_ves"]
      },
      {
        "title": "Лучший колбасный мем",
        "description": "",
        "image": "/n_19.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["artur_ne_vyshel", "ebya_belok", "patsok_i_shtora", "shtura_patsoka", "beschovnost", "under_der_woter", "luchshe_chem_nechego"]
      },
      {
        "title": "Самое Базованое рабочее место/сетап 2024",
        "description": "",
        "image": "/n_20.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["musorka_olega", "musorka_dimasa", "musorka_igorya", "musorka_dimasa_odessa","musorka_tomasa","musorka_vadima","musorka_miha","musorka_artuk","musorka_vlad"]
      },
      {
        "title": "Лучшая сделка пацюка",
        "description": "",
        "image": "/n_21.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["1", "2", "3"]
      },
      {
        "title": "Лучшая игра года",
        "description": "",
        "image": "/n_22.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["zhdalker2", "marvel_rivals", "astrobot", "path_of_exile", "helldivers2", "steam_deck", "satisfactory", "phantom_liberty", "wukong"]
      },
      {
        "title": "Лучшая игра по эмоциям",
        "description": "",
        "image": "/n_23.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["kc", "marvel_rivals2", "my_summer_car2", "stalker"]
      },
      {
        "title": "Катафалк (не успел родиться - уже сдох)",
        "description": "",
        "image": "/n_24.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["konkord", "diablo3", "helldivers", "zhiga_v_may"]
      },
      {
        "title": "Паттерн дождя (лучший соулслайк)",
        "description": "",
        "image": "/n_25.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["lays_of_pi", "vukong", "dls_dlya_enderlinga", "kukhnya_v_maribore"]
      },
      {
        "title": "Соушал событие года",
        "description": "",
        "image": "/n_26.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["vecherinki_pdiddy", "ukrainskaya_diaspora", "trampaharis",	"protest_gruzi","protest_korea","kursk","sirya","sector_vs_izra"]
      },
      {
        "title": "лучший аудиофайл года",
        "description": "",
        "image": "/n_27.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["na_menya_gladit", "tak_tak_tak", "tranbalon"]
      },
      {
        "title": "лучший гаджет",
        "description": "",
        "image": "/n_28.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["macbook", "pk", "stimdeck", "ps5", "noutbuk", "piksel_olega"]
      },
      {
        "title": "самая одижидаммая игра",
        "description": "",
        "image": "/n_29.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": ["witcher4", "monsterhunter", "gtab", "death_stranding2", "lize_of_pi"]
      }
    ];
    this.createInitialData(candidates, nominees);
  }

  async createInitialData(candidates: any[], nominees: any[]): Promise<void> {
    try {
      // Create a batch
      const batch = writeBatch(this.#fs);

      // Add candidates
      const candidatesCollection = collection(this.#fs, 'candidate');
      candidates.forEach(candidate => {
        const candidateRef = doc(candidatesCollection, candidate.id);
        batch.set(candidateRef, candidate);
      });

      // Add nominees
      const nomineesCollection = collection(this.#fs, 'nominee');
      nominees.forEach((nominee, index) => {
        const nomineeRef = doc(nomineesCollection, `nominee_${index + 1}`);
        batch.set(nomineeRef, {...nominee, order: index});
      });

      // Commit the batch
      await batch.commit();
      console.log('Records created successfully');
    } catch (error) {
      console.error('Error creating records:', error);
      throw error;
    }
  }

  async #syncUser(authUser: User) {
    try {
      const userDocRef = doc(this.#fs, 'user', authUser.uid);
      let userDoc: any = await getDoc(userDocRef);
      this.userData = userDoc.data();

      // If user document doesn't exist, create it
      if (!userDoc.exists()) {
        const newUser: UserInterface = {
          id: authUser.uid,
          name: authUser.displayName ?? 'Anonymous',
          votes: {} // Initialize empty votes object
        };

        await setDoc(userDocRef, newUser);
        console.log('Created new user document');
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  }

  signIn() {
    signInWithPopup(this.#auth, new GoogleAuthProvider()).then();
  }
}
