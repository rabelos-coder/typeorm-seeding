import { Faker } from '@faker-js/faker'
import { define, factory } from '@rabeloscoder/typeorm-seeding'
import { Pet } from '../sample/entities/Pet.entity'
import { User } from '../sample/entities/User.entity'

define(Pet, (faker: Faker) => {
  const gender = faker.datatype.number(1) > 0.5 ? 'male' : 'female'
  const name = faker.name.firstName(gender)

  const pet = new Pet()
  pet.name = name
  pet.age = faker.datatype.number()
  pet.user = factory(User)({ roles: ['admin'] }) as any
  return pet
})
