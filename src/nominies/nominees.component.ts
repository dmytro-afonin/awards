import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChildren
} from '@angular/core';
import {collection, collectionData, doc, docData, Firestore, updateDoc} from '@angular/fire/firestore';
import {combineLatest, Observable, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Auth, User, user} from '@angular/fire/auth';
import {NgClass, NgStyle} from '@angular/common';

interface Nominee {
  id: string;
  candidates: string[];// candidateId / userIDS votes
  title: string;
  description: string;
  image: string;
  canVote: boolean;
  showWinner: boolean;
  winner: string;
  order: number;
}

interface Candidate {
  id: string;
  city: string;
  country: string;
  users: string[];
  name: string;
  image: string;
  winner: boolean;
}

interface DisplayedNominee {
  id: string;
  candidates: Candidate[];
  title: string;
  description: string;
  image: string;
  canVote: boolean;
  showWinner: boolean;
  order: number;
  users: UserInterface[];
}

interface UserInterface {
  id: string;
  name: string;
  photo: string;
  admin: boolean;
  presenterMode: boolean;
  votes: Record<string, string>; //nomineeId / candidateId
}

@Component({
  selector: 'app-nominee',
  templateUrl: './nominees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    /* Container for sections */
    .wrapper {
      height: calc(100vh - 6rem);
      scroll-snap-type: y mandatory;
      overflow-y: auto;
      scrollbar-width: none; /* For Firefox */
      -ms-overflow-style: none; /* For IE and Edge */
    }

    .wrapper::-webkit-scrollbar {
      display: none; /* For Chrome, Safari, and Opera */
    }

    /* Each section takes full viewport height */
    section {
      min-height: calc(100vh - 6rem);
      scroll-snap-align: start;
      overflow-y: auto;
    }
  `,
  imports: [
    NgStyle,
    NgClass
  ],
  standalone: true
})
export class NomineesComponent {
  readonly #fs: Firestore = inject(Firestore); // inject Cloud Firestore
  readonly #cd = inject(ChangeDetectorRef);
  readonly #auth = inject(Auth);
  readonly #user$ = user(this.#auth);

  @ViewChildren('sectionRef') sectionElements!: QueryList<ElementRef>;

  #collect<T>(collectionName: string): Observable<T[]> {
    return collectionData(collection(this.#fs, collectionName), {idField: 'id'}) as Observable<T[]>
  }

  auth: User | null = null;
  displayedNominees: DisplayedNominee[] = [];
  user: UserInterface | null = null;
  constructor() {
    this.#user$.pipe(
      takeUntilDestroyed(),
      tap((user) => {
        this.auth = user;
        this.#cd.markForCheck();
      }),
      switchMap((user) => {
        const ref = doc(this.#fs, 'user', user?.uid ?? '');
        return docData(ref);
      }),
      tap((ref)  => {
        this.user = ref as UserInterface;
        this.#cd.markForCheck();
      })
    ).subscribe();

    combineLatest([
      this.#collect<Candidate>('candidate'),
      this.#collect<Nominee>('nominee'),
      this.#collect<UserInterface>('user'),
    ]).pipe(
      takeUntilDestroyed(),
      tap(([candidates , nominees, users]) => {
        this.displayedNominees = this.#getDisplayedNominees(candidates, nominees, users).sort((a, b) => a.order - b.order);
        this.#cd.markForCheck();
      })
    ).subscribe();
  }


  #getDisplayedNominees(candidates: Candidate[] , nominees: Nominee[], users: UserInterface[]): DisplayedNominee[] {
    return nominees.map(nominee => {
      const map: Record<string, string[]> = {};
      const votedUsers = users.filter(u => u.votes[nominee.id]);
      let max = 0;
      votedUsers.forEach(u => {
        const candidateId = u.votes[nominee.id];
        if (!map[candidateId]) {
          map[candidateId] = [];
        }
        map[candidateId].push(u.name);
        max = Math.max(map[candidateId].length, max);
      });
      return {
        id: nominee.id,
        candidates: nominee.candidates
          .map(cId => candidates.find(c => c.id === cId))
          .filter(c => !!c)
          .map(c => ({...c, users: map[c?.id], winner: map[c?.id]?.length === max})),
        title: nominee.title,
        description: nominee.description,
        image: nominee.image,
        canVote: nominee.canVote,
        showWinner: nominee.showWinner,
        order: nominee.order,
        users: votedUsers
      }
    });
  }

  vote(nominee: DisplayedNominee, candidate: Candidate, userId: string, index: number) {
    this.#updateField('user', userId, `votes.${nominee.id}`, candidate.id).then();
    this.#scrollToNextSection(index);
  }

  async #updateField(collectionName: string, docId: string, fieldName: string, newValue: any) {
    const docRef = doc(this.#fs, collectionName, docId);
    return updateDoc(docRef, {[fieldName]: newValue});
  }

  #scrollToNextSection(currentIndex: number): void {
    const sectionsArray = this.sectionElements.toArray();
    const nextSection = sectionsArray[currentIndex + 1];
    nextSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  toggleWinner(nominee: DisplayedNominee) {
    this.#updateField('nominee', nominee.id, 'showWinner', !nominee.showWinner).then();
  }

  toggleVote(nominee: DisplayedNominee) {
    this.#updateField('nominee', nominee.id, 'canVote', !nominee.canVote).then();
  }

  top() {
    const sectionsArray = this.sectionElements.toArray();
    sectionsArray[0].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start'  });
  }
}
