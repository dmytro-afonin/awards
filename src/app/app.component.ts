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
        "id": "n_1_1",
        "name": "Появление микрочела у Димаса",
        "image": "/n_1_1.jpg"
    },
    {
        "id": "n_1_2",
        "name": "Переезд Владика в Польшу",
        "image": "/n_1_2.jpg"
    },
    {
        "id": "n_1_3",
        "name": "Игорь теперь платит налоги",
        "image": "/n_1_3.jpg"
    },
    {
        "id": "n_1_4",
        "name": "Воскрешние Толика в дс",
        "image": "/n_1_4.jpg"
    },
    {
        "id": "n_1_5",
        "name": "Переезд Томаса в Варшаву/освобождение",
        "image": "/n_1_5.jpg"
    },
    {
        "id": "n_1_6",
        "name": "У Димаса теперь не батрачка, а работа",
        "image": "/n_1_6.jpg"
    },
    {
        "id": "n_1_7",
        "name": "Артур теперь восхищается",
        "image": "/n_1_7.jpg"
    },
    {
        "id": "n_2_1",
        "name": "Артур десятый раз пиздует в Словению",
        "image": "/n_2_1.jpg"
    },
    {
        "id": "n_2_2",
        "name": "Дима фоткает стройку (1 см от депортации)",
        "image": "/n_2_2.jpg"
    },
    {
        "id": "n_2_3",
        "name": "Игорь постоянно ломает велик и падает с него",
        "image": "/n_2_3.jpg"
    },
    {
        "id": "n_2_4",
        "name": "Томас не различает цифры 3 и 5",
        "image": "/n_2_4.jpg"
    },
    {
        "id": "n_2_5",
        "name": "Димас покупает макбук и на след день дают свет",
        "image": "/n_2_5.jpg"
    },
    {
        "id": "n_2_6",
        "name": "Димас забыл скрыть порно игру в стиме",
        "image": "/n_2_6.jpg"
    },
    {
        "id": "n_2_7",
        "name": "Пенисиловка умирает изза апдейта",
        "image": "/n_2_7.jpg"
    },
    {
        "id": "n_2_8",
        "name": "Толик не поженился на японке",
        "image": "/n_2_8.jpg"
    },
    {
        "id": "n_2_9",
        "name": "Владик упал с скалодрома",
        "image": "/n_2_9.jpg"
    },
    {
        "id": "n_3_1",
        "name": "Видеокарта Игоря",
        "image": "/n_3_1.jpg"
    },
    {
        "id": "n_3_2",
        "name": "Кироши Димаса",
        "image": "/n_3_2.jpg"
    },
    {
        "id": "n_3_3",
        "name": "Пшикалка для пэпсы 2",
        "image": "/n_3_3.jpg"
    },
    {
        "id": "n_3_4",
        "name": "Стимдек Диско",
        "image": "/n_3_4.jpg"
    },
    {
        "id": "n_3_5",
        "name": "Спиннер",
        "image": "/n_3_5.jpg"
    },
    {
        "id": "n_3_6",
        "name": "Пальто Толи за 3 гривны",
        "image": "/n_3_6.jpg"
    },
    {
        "id": "n_4_1",
        "name": "Батрачка Димаса",
        "image": "/n_4_1.jpg"
    },
    {
        "id": "n_4_2",
        "name": "Батрачка Томаса",
        "image": "/n_4_2.jpg"
    },
    {
        "id": "n_4_3",
        "name": "Бабрачка Игоря",
        "image": "/n_4_3.jpg"
    },
    {
        "id": "n_4_4",
        "name": "Баброчка Влада",
        "image": "/n_4_4.jpg"
    },
    {
        "id": "n_5_1",
        "name": "Игорь теперь двухколёсный",
        "image": "/n_5_1.jpg"
    },
    {
        "id": "n_5_2",
        "name": "Димас с Томасом решили быть дронщиками",
        "image": "/n_5_2.jpg"
    },
    {
        "id": "n_5_3",
        "name": "Влад открывает студию звукозаписи",
        "image": "/n_5_3.jpg"
    },
    {
        "id": "n_5_4",
        "name": "Диско теперь водитель DnD",
        "image": "/n_5_4.jpg"
    },
    {
        "id": "n_5_5",
        "name": "Ededoppler хочет бросить вызов Гордону Рамзи",
        "image": "/n_5_5.jpg"
    },
    {
        "id": "n_5_6",
        "name": "Дима пытается получить кофейный передоз",
        "image": "/n_5_6.jpg"
    },
    {
        "id": "n_6_1",
        "name": "Димас",
        "image": "/n_6_1.jpg"
    },
    {
        "id": "n_7_1",
        "name": "Локоточками туда-сюда",
        "image": "/n_7_1.jpg"
    },
    {
        "id": "n_7_2",
        "name": "Сосед Владика в Мариборе",
        "image": "/n_7_2.jpg"
    },
    {
        "id": "n_7_3",
        "name": "Олег не вернулся",
        "image": "/n_7_3.jpg"
    },
    {
        "id": "n_7_4",
        "name": "157 крокодилов Томаса",
        "image": "/n_7_4.jpg"
    },
    {
        "id": "n_7_5",
        "name": "Патрика распидорасило на сво",
        "image": "/n_7_5.jpg"
    },
    {
        "id": "n_7_6",
        "name": "Артур сьебался с диска пока Димас его ждет",
        "image": "/n_7_6.jpg"
    },
    {
        "id": "n_7_7",
        "name": "Башня хлеба",
        "image": "/n_7_7.jpg"
    },
    {
        "id": "n_8_1",
        "name": "Пацюк вьебался и погнул спицу",
        "image": "/n_8_1.jpg"
    },
    {
        "id": "n_8_2",
        "name": "В пацюка вьебался поляк сзади",
        "image": "/n_8_2.jpg"
    },
    {
        "id": "n_8_3",
        "name": "Пацюк сделал сальтуху на велике в лесу",
        "image": "/n_8_3.jpg"
    },
    {
        "id": "n_8_4",
        "name": "Пацюк боится ездить на новом велике",
        "image": "/n_8_4.jpg"
    },
    {
        "id": "n_9_1",
        "name": "ИИ повсюду",
        "image": "/n_9_1.jpg"
    },
    {
        "id": "n_9_2",
        "name": "Трамп ГУБАМИ закончил +100500 воин",
        "image": "/n_9_2.jpg"
    },
    {
        "id": "n_9_3",
        "name": "НЕФТЕБАЗЫ",
        "image": "/n_9_3.jpg"
    },
    {
        "id": "n_9_4",
        "name": "Усик побил негра без смс и регистрации",
        "image": "/n_9_4.jpg"
    },
    {
        "id": "n_9_5",
        "name": "Криптовалюты Трампа",
        "image": "/n_9_5.jpg"
    },
    {
        "id": "n_9_6",
        "name": "Файлы Эпштейна",
        "image": "/n_9_6.jpg"
    },
    {
        "id": "n_9_7",
        "name": "Опять война евреев и не евреев(мы такое осуждаем)",
        "image": "/n_9_7.jpg"
    },
    {
        "id": "n_10_1",
        "name": "Clair Obscur: Expedition 33",
        "image": "/n_10_1.jpg"
    },
    {
        "id": "n_10_2",
        "name": "Death Stranding 2",
        "image": "/n_10_2.jpg"
    },
    {
        "id": "n_10_3",
        "name": "Donkey Kong Bananza",
        "image": "/n_10_3.jpg"
    },
    {
        "id": "n_10_4",
        "name": "Hades II",
        "image": "/n_10_4.jpg"
    },
    {
        "id": "n_10_5",
        "name": "Kingdom Come: Deliverance II",
        "image": "/n_10_5.jpg"
    },
    {
        "id": "n_10_6",
        "name": "Hollow Knight: Silksong",
        "image": "/n_10_6.jpg"
    },
    {
        "id": "n_11_1",
        "name": "Экспедиция 33",
        "image": "/n_11_1.jpg"
    },
    {
        "id": "n_11_2",
        "name": "Диспатч",
        "image": "/n_11_2.jpg"
    },
    {
        "id": "n_11_3",
        "name": "Батлбилд 6",
        "image": "/n_11_3.jpg"
    },
    {
        "id": "n_11_4",
        "name": "Хадэс 2",
        "image": "/n_11_4.jpg"
    },
    {
        "id": "n_11_5",
        "name": "Инждрих 2",
        "image": "/n_11_5.jpg"
    },
    {
        "id": "n_11_6",
        "name": "Монст хантер Дикий",
        "image": "/n_11_6.jpg"
    },
    {
        "id": "n_11_7",
        "name": "Дум ",
        "image": "/n_11_7.jpg"
    },
    {
        "id": "n_12_1",
        "name": "Майнкрафт сервер Томаса",
        "image": "/n_12_1.jpg"
    },
    {
        "id": "n_12_2",
        "name": "Монитор пацючары шоб наебать налоги",
        "image": "/n_12_2.jpg"
    },
    {
        "id": "n_12_3",
        "name": "Любой додеп Толика",
        "image": "/n_12_3.jpg"
    },
    {
        "id": "n_12_4",
        "name": "Нож Димаса в кантрастрыке",
        "image": "/n_12_4.jpg"
    },
    {
        "id": "n_13_1",
        "name": "Пепсик",
        "image": "/n_13_1.jpg"
    },
    {
        "id": "n_13_2",
        "name": "Геральт",
        "image": "/n_13_2.jpg"
    },
    {
        "id": "n_13_3",
        "name": "Луна",
        "image": "/n_13_3.jpg"
    },
    {
        "id": "n_13_4",
        "name": "Бруна",
        "image": "/n_13_4.jpg"
    },
    {
        "id": "n_13_5",
        "name": "DayZ",
        "image": "/n_13_5.jpg"
    },
    {
        "id": "n_13_6",
        "name": "Летательные аппараты у Игоря в хате",
        "image": "/n_13_6.jpg"
    },
    {
        "id": "n_13_7",
        "name": "Котя",
        "image": "/n_13_7.jpg"
    },
    {
        "id": "n_14_1",
        "name": "Игорь собирает что то на камеру",
        "image": "/n_14_1.jpg"
    },
    {
        "id": "n_14_2",
        "name": "Трансляции порно игр от Димаса(когда Аня не дома)",
        "image": "/n_14_2.jpg"
    },
    {
        "id": "n_14_3",
        "name": "Толик рассказывает как правильно заниматься сексом",
        "image": "/n_14_3.jpg"
    },
    {
        "id": "n_14_4",
        "name": "Понять почему Томас грусный",
        "image": "/n_14_4.jpg"
    },
    {
        "id": "n_14_5",
        "name": "Понять почему Томас весёлый",
        "image": "/n_14_5.jpg"
    },
    {
        "id": "n_14_6",
        "name": "Любой рассказ Владика и Артура про работу",
        "image": "/n_14_6.jpg"
    },
    {
        "id": "n_15_1",
        "name": "Симулятор Вора (Crime Simulator)",
        "image": "/n_15_1.jpg"
    },
    {
        "id": "n_15_2",
        "name": "Симулятор Пожарника (Firefighting Simulator)",
        "image": "/n_15_2.jpg"
    },
    {
        "id": "n_15_3",
        "name": "Углекопа (Out of Ore)",
        "image": "/n_15_3.jpg"
    },
    {
        "id": "n_15_4",
        "name": "Пенисиловка (Bellwright)",
        "image": "/n_15_4.jpg"
    },
    {
        "id": "n_15_5",
        "name": "R.E.P.O.",
        "image": "/n_15_5.jpg"
    },
    {
        "id": "n_15_6",
        "name": "PEAK",
        "image": "/n_15_6.jpg"
    },
    {
        "id": "n_15_7",
        "name": "Курительные Водители (RV There Yet?)",
        "image": "/n_15_7.jpg"
    },
    {
        "id": "n_16_1",
        "name": "Томас",
        "image": "/n_16_1.jpg"
    },
    {
        "id": "n_16_2",
        "name": "Димас",
        "image": "/n_16_2.jpg"
    }
    ];
    const nominees = [
      {
        "title": "Самое грандиозное событие 2025",
        "description": "",
        "image": "/n_1.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_1_1",
            "n_1_2",
            "n_1_3",
            "n_1_4",
            "n_1_5",
            "n_1_6",
            "n_1_7"
        ]
    },
    {
        "title": "Самый грандиозный фейл 2025",
        "description": "",
        "image": "/n_2.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_2_1",
            "n_2_2",
            "n_2_3",
            "n_2_4",
            "n_2_5",
            "n_2_6",
            "n_2_7",
            "n_2_8"
        ]
    },
    {
        "title": "Приобретение года",
        "description": "",
        "image": "/n_3.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_3_1",
            "n_3_2",
            "n_3_3",
            "n_3_4",
            "n_3_5",
            "n_3_6"
        ]
    },
    {
        "title": "Самая ебаная работа года  (Нытик года)",
        "description": "",
        "image": "/n_4.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_4_1",
            "n_4_2",
            "n_4_3",
            "n_4_4"
        ]
    },
    {
        "title": "Хобби года",
        "description": "",
        "image": "/n_5.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_5_1",
            "n_5_2",
            "n_5_3",
            "n_5_4",
            "n_5_5",
            "n_5_6"
        ]
    },
    {
        "title": "Лучший hdr года",
        "description": "",
        "image": "/n_6.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_6_1"
        ]
    },
    {
        "title": "Мем года",
        "description": "",
        "image": "/n_7.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_7_1",
            "n_7_2",
            "n_7_3",
            "n_7_4",
            "n_7_5",
            "n_7_6",
            "n_7_7"
        ]
    },
    {
        "title": "Пацючий велоприкол",
        "description": "",
        "image": "/n_8.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_8_1",
            "n_8_2",
            "n_8_3",
            "n_8_4"
        ]
    },
    {
        "title": "Сошиал событие 2025",
        "description": "",
        "image": "/n_9.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_9_1",
            "n_9_2",
            "n_9_3",
            "n_9_4",
            "n_9_5",
            "n_9_6",
            "n_9_7"
        ]
    },
    {
        "title": "Игра года(список по версии нормисов)",
        "description": "",
        "image": "/n_10.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_10_1",
            "n_10_2",
            "n_10_3",
            "n_10_4",
            "n_10_5",
            "n_10_6"
        ]
    },
    {
        "title": "Игра года нормальных пацанов",
        "description": "",
        "image": "/n_11.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_11_1",
            "n_11_2",
            "n_11_3",
            "n_11_4",
            "n_11_5",
            "n_11_6",
            "n_11_7"
        ]
    },
    {
        "title": "Додеп года",
        "description": "",
        "image": "/n_12.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_12_1",
            "n_12_2",
            "n_12_3",
            "n_12_4"
        ]
    },
    {
        "title": "Питомец года",
        "description": "",
        "image": "/n_13.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_13_1",
            "n_13_2",
            "n_13_3",
            "n_13_4",
            "n_13_5",
            "n_13_6",
            "n_13_7"
        ]
    },
    {
        "title": "Лучший ивернт года",
        "description": "",
        "image": "/n_14.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_14_1",
            "n_14_2",
            "n_14_3",
            "n_14_4",
            "n_14_5",
            "n_14_6"
        ]
    },
    {
        "title": "Лучший стим Симулятор для Мужчин",
        "description": "",
        "image": "/n_15.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_15_1",
            "n_15_2",
            "n_15_3",
            "n_15_4",
            "n_15_5",
            "n_15_6",
            "n_15_7"
        ]
    },
    {
        "title": "Где хостить сервер майнкрафта",
        "description": "",
        "image": "/n_16.jpg",
        "canVote": true,
        "showWinner": false,
        "candidates": [
            "n_16_1",
            "n_16_2"
        ]
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
