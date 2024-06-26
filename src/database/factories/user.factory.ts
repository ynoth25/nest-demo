import { hash } from 'bcrypt';
import { setSeederFactory } from 'typeorm-extension';

import { User } from '../entities/user.entity';

export default setSeederFactory(User, async (faker) => {
    const user = new User();

    user.userName = faker.internet.userName();
    user.email = faker.internet.email();
    user.password = await hash('testpassword', 10);

    return user;
});
