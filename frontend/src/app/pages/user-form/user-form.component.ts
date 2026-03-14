import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent {
  isLoginMode = true;
  user: User = { id: 0, name: '', email: '', passwordHash: '' };

  userService = inject(UserService);
  router = inject(Router);

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (this.isLoginMode) {
      // Dummy login: Fetch all users and find one matching email
      this.userService.getUsers().subscribe(users => {
        const found = users.find(u => u.email === this.user.email);
        if (found) {
          this.userService.setCurrentUser(found);
          alert('Logado com sucesso!');
          this.router.navigate(['/']);
        } else {
          alert('Usuário não encontrado.');
        }
      });
    } else {
      // Register
      this.userService.registerUser(this.user).subscribe({
        next: (newUser) => {
          alert('Registrado com sucesso!');
          this.userService.setCurrentUser(newUser);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Erro ao registrar', err);
          alert('Erro ao registrar usuário. Tente novamente.');
        }
      });
    }
  }
}
